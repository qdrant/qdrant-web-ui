// Live cluster scenario for seeing the Cluster tab's auto-refresh in action. A
// 4-node cluster whose topology changes over time, the way a real one does
// while shards move and replicas recover:
//   - shard 4 is moved back and forth between peers 2 and 3 (a Partial replica
//     plus a transfer arrow, then the move completes and the source is dropped);
//   - the replica of shard 5 on peer 2 dies, recovers through a transfer from
//     peer 4, and becomes Active again;
//   - shard 3 is replicated from the local peer 1 to peer 3, reporting its
//     progress (stage, records, ETA) in the transfer comment, the way Qdrant
//     does. Comments are only reported by a peer taking part in the transfer,
//     so the other transfers (between remote peers) have none;
//   - the points counts of the local shards keep growing.
// The state is derived from the clock, so every endpoint agrees on the current
// phase and the monitor changes on (almost) every 5s refresh.
//
// Run with `npm run dev:msw -- cluster-live`.
import { http } from 'msw';
import { BASE_URL, ok } from '../lib';
import { makeClusterHandlers } from './cluster-common';

const SHARD_COUNT = 6;
const REPLICATION_FACTOR = 2;
const SELF_PEER = 1;
// Slightly longer than the monitor's refresh interval, so consecutive refreshes
// usually land in different phases.
const PHASE_MS = 6000;
const PHASE_COUNT = 4;

const currentTick = () => Math.floor(Date.now() / PHASE_MS);

// GET /cluster — 4 peers; the raft commit index advances with every phase.
function makeClusterInfo(tick) {
  return {
    status: 'enabled',
    peer_id: SELF_PEER,
    peers: {
      1: { uri: 'http://qdrant-node-1:6335/' },
      2: { uri: 'http://qdrant-node-2:6335/' },
      3: { uri: 'http://qdrant-node-3:6335/' },
      4: { uri: 'http://qdrant-node-4:6335/' },
    },
    raft_info: {
      term: 7,
      commit: 1000 + (tick % 100000),
      pending_operations: 0,
      leader: SELF_PEER,
      role: 'Leader',
      is_voter: true,
    },
    consensus_thread_status: { consensus_thread_status: 'working', last_update: new Date().toISOString() },
    message_send_failures: {},
  };
}

// Replicas of shard 4 (moving between peers 2 and 3) for each phase.
const SHARD_4_PHASES = [
  // Moving 2 -> 3: the target replica is Partial while the data streams in.
  {
    replicas: [
      { peer_id: 2, state: 'Active' },
      { peer_id: 3, state: 'Partial' },
    ],
    transfer: { from: 2, to: 3 },
  },
  // Move completed: the source replica is gone.
  { replicas: [{ peer_id: 3, state: 'Active' }], transfer: null },
  // Moving back 3 -> 2.
  {
    replicas: [
      { peer_id: 3, state: 'Active' },
      { peer_id: 2, state: 'Partial' },
    ],
    transfer: { from: 3, to: 2 },
  },
  // Move completed.
  { replicas: [{ peer_id: 2, state: 'Active' }], transfer: null },
];

// The replica of shard 5 on peer 2 for each phase: it dies, then recovers from peer 4.
const SHARD_5_PEER_2_PHASES = [
  { state: 'Active', transfer: null },
  { state: 'Dead', transfer: null },
  { state: 'Partial', transfer: { from: 4, to: 2 } },
  { state: 'Active', transfer: null },
];

// Replication of shard 3 from the local peer 1 to peer 3, on its own longer cycle
// so its progress changes on every refresh. Stages (in seconds from the cycle start)
// follow a `stream_records` transfer; afterwards the new replica stays Active
// until the cycle starts over.
const REPLICATION_CYCLE_S = 45;
const REPLICATION_RECORDS = 120000;
const REPLICATION_STAGES = [
  { name: 'proxifying', from: 0, to: 3 },
  { name: 'transferring', from: 3, to: 27 },
  { name: 'syncing queued updates', from: 27, to: 31 },
  { name: 'waiting consensus', from: 31, to: 34 },
  { name: 'finalizing', from: 34, to: 36 },
];
const REPLICATION_END_S = 36;

// Builds the comment the way Qdrant's transfer task pool does:
// "<stage> (<elapsed>s) | Transferring records (<n>/<total>), ETA: <eta>s | read: <r>s, send: <s>s".
function makeReplicationComment(elapsed) {
  const stage = REPLICATION_STAGES.find((s) => elapsed >= s.from && elapsed < s.to);
  const transferring = REPLICATION_STAGES[1];
  const parts = [`${stage.name} (${(elapsed - stage.from).toFixed(2)}s)`];

  if (elapsed >= transferring.from) {
    const share = Math.min(1, (elapsed - transferring.from) / (transferring.to - transferring.from));
    const transferred = Math.floor(REPLICATION_RECORDS * share);
    let records = `Transferring records (${transferred}/${REPLICATION_RECORDS})`;
    if (share < 1) records += `, ETA: ${(transferring.to - elapsed).toFixed(2)}s`;
    parts.push(records);
    const busy = Math.min(elapsed, transferring.to) - transferring.from;
    parts.push(`read: ${(busy * 0.3).toFixed(2)}s, send: ${(busy * 0.6).toFixed(2)}s`);
  }

  return parts.join(' | ');
}

function makeReplication(nowMs) {
  const elapsed = (nowMs / 1000) % REPLICATION_CYCLE_S;
  if (elapsed >= REPLICATION_END_S) {
    return { replica: { shard_id: 3, peer_id: 3, state: 'Active' }, transfer: null };
  }
  return {
    replica: { shard_id: 3, peer_id: 3, state: 'Partial' },
    transfer: {
      shard_id: 3,
      from: SELF_PEER,
      to: 3,
      sync: true,
      method: 'stream_records',
      comment: makeReplicationComment(elapsed),
    },
  };
}

// GET /collections/{name}/cluster — 6 shards with replication factor 2 on 4 peers.
function makeCollectionClusterInfo(tick, nowMs = tick * PHASE_MS) {
  const phase = tick % PHASE_COUNT;
  const growth = (tick % 1000) * 37;
  const shard4 = SHARD_4_PHASES[phase];
  const shard5 = SHARD_5_PEER_2_PHASES[phase];

  const replication = makeReplication(nowMs);

  const transfers = [];
  if (replication.transfer) transfers.push(replication.transfer);
  if (shard4.transfer) {
    transfers.push({ shard_id: 4, ...shard4.transfer, sync: false, method: 'stream_records' });
  }
  if (shard5.transfer) {
    transfers.push({ shard_id: 5, ...shard5.transfer, sync: false, method: 'stream_records' });
  }

  return {
    peer_id: SELF_PEER,
    shard_count: SHARD_COUNT,
    local_shards: [
      { shard_id: 0, points_count: 12000 + growth, state: 'Active' },
      { shard_id: 3, points_count: 9800 + growth, state: 'Active' },
      { shard_id: 4, points_count: 11200 + growth, state: 'Active' },
    ],
    remote_shards: [
      { shard_id: 0, peer_id: 2, state: 'Active' },
      { shard_id: 1, peer_id: 2, state: 'Active' },
      { shard_id: 1, peer_id: 3, state: 'Active' },
      { shard_id: 2, peer_id: 3, state: 'Active' },
      { shard_id: 2, peer_id: 4, state: 'Active' },
      { shard_id: 3, peer_id: 4, state: 'Active' },
      replication.replica,
      ...shard4.replicas.map((replica) => ({ shard_id: 4, ...replica })),
      { shard_id: 5, peer_id: 4, state: 'Active' },
      { shard_id: 5, peer_id: 2, state: shard5.state },
    ],
    // Qdrant sorts the transfers by shard id.
    shard_transfers: transfers.sort((a, b) => a.shard_id - b.shard_id),
  };
}

const initialTick = currentTick();

export const clusterLiveHandlers = [
  // Time-dependent overrides first; they shadow the static ones of the factory.
  http.get(`${BASE_URL}/cluster`, () => ok(makeClusterInfo(currentTick()))),
  http.get(`${BASE_URL}/collections/:collection/cluster`, () =>
    ok(makeCollectionClusterInfo(currentTick(), Date.now()))
  ),
  // Telemetry (cluster + resharding enabled) and collection info.
  ...makeClusterHandlers({
    clusterInfo: makeClusterInfo(initialTick),
    collectionClusterInfo: makeCollectionClusterInfo(initialTick),
    shardNumber: SHARD_COUNT,
    replicationFactor: REPLICATION_FACTOR,
    reshardingEnabled: true,
  }),
];
