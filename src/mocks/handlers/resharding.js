// Resharding scenario for the Cluster tab: a 3-node cluster with a scale-down
// resharding in progress (shard 2 is being removed). It exercises the resharding
// UI — the status banner, the Abort button, the ReshardingScaleDown shard state,
// and the live progress polled from the cluster-manager metadata key.
//
// Layered on top of base.js via the cluster factory; adds the metadata endpoint.
// Run with `npm run dev:msw -- resharding`.
import { http } from 'msw';
import { BASE_URL, ok } from '../lib';
import { makeClusterHandlers } from './cluster-common';

const SHARD_COUNT = 3;
const REPLICATION_FACTOR = 2;
const SELF_PEER = 1;

// GET /cluster — 3 peers.
const clusterInfo = {
  status: 'enabled',
  peer_id: SELF_PEER,
  peers: {
    1: { uri: 'http://qdrant-node-1:6335/' },
    2: { uri: 'http://qdrant-node-2:6335/' },
    3: { uri: 'http://qdrant-node-3:6335/' },
  },
  raft_info: { term: 9, commit: 2048, pending_operations: 0, leader: SELF_PEER, role: 'Leader', is_voter: true },
  consensus_thread_status: { consensus_thread_status: 'working', last_update: '2026-01-01T00:00:00Z' },
  message_send_failures: {},
};

// Scale-down in progress: shard 2 is being removed. Its two replicas (peers 1
// and 3) are in ReshardingScaleDown while their points stream into the remaining
// shards; the transfer draws an arrow, and resharding_operations drives the
// status banner + Abort button.
const collectionClusterInfo = {
  peer_id: SELF_PEER,
  shard_count: SHARD_COUNT,
  local_shards: [
    { shard_id: 0, points_count: 120000, state: 'Active' },
    { shard_id: 2, points_count: 80000, state: 'ReshardingScaleDown' },
  ],
  remote_shards: [
    { shard_id: 0, peer_id: 2, state: 'Active' },
    { shard_id: 1, peer_id: 2, state: 'Active' },
    { shard_id: 1, peer_id: 3, state: 'Active' },
    { shard_id: 2, peer_id: 3, state: 'ReshardingScaleDown' },
  ],
  shard_transfers: [{ shard_id: 2, from: SELF_PEER, to: 3, sync: true, method: 'resharding_stream_records' }],
  resharding_operations: [
    {
      uuid: 'e5000000-0000-4000-8000-000000000001',
      direction: 'down',
      shard_id: 2,
      peer_id: SELF_PEER,
      shard_key: null,
    },
  ],
};

export const reshardingHandlers = [
  ...makeClusterHandlers({
    clusterInfo,
    collectionClusterInfo,
    shardNumber: SHARD_COUNT,
    replicationFactor: REPLICATION_FACTOR,
    reshardingEnabled: true,
  }),
  // Cluster-manager progress key, polled while a resharding op runs (see
  // reshardingProgress.js). Not part of the public OpenAPI — an internal
  // metadata read — reported to the UI as { description, waiting }.
  http.get(`${BASE_URL}/cluster/metadata/keys/:key`, () =>
    ok({ description: 'Migrating points from shard 2 · 48,320 / 80,000', waiting: false })
  ),
];
