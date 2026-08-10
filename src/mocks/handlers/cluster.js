// Cluster (distributed) scenario for working on the Cluster tab of the
// collection page. A healthy 4-node deployment with the collection sharded and
// replicated across peers, plus one shard transfer in progress so the monitor
// renders peers, shard states and a transfer arrow.
//
// Layered on top of base.js: only the cluster-related endpoints are overridden.
// Run with `npm run dev:msw -- cluster`.
import { http } from 'msw';
import { BASE_URL, ok } from '../lib';
import { makeTelemetry, makeCollectionInfo } from '../data';

const SHARD_COUNT = 6;
const REPLICATION_FACTOR = 2;

// The peer that serves this dashboard.
const SELF_PEER = 1;

// GET /cluster — the 4 peers of the cluster.
const clusterInfo = {
  status: 'enabled',
  peer_id: SELF_PEER,
  peers: {
    1: { uri: 'http://qdrant-node-1:6335/' },
    2: { uri: 'http://qdrant-node-2:6335/' },
    3: { uri: 'http://qdrant-node-3:6335/' },
    4: { uri: 'http://qdrant-node-4:6335/' },
  },
  raft_info: { term: 7, commit: 1234, pending_operations: 0, leader: SELF_PEER, role: 'Leader', is_voter: true },
  consensus_thread_status: { consensus_thread_status: 'working', last_update: '2026-01-01T00:00:00Z' },
  message_send_failures: {},
};

// GET /collections/{name}/cluster — 6 shards, replication factor 2, spread over
// the 4 peers (each shard has 2 replicas). Shard 4 is being moved from peer 2
// to peer 3 (Partial replica + a matching entry in shard_transfers), and one
// replica of shard 5 is Dead, so the monitor shows a range of states.
const collectionClusterInfo = {
  peer_id: SELF_PEER,
  shard_count: SHARD_COUNT,
  local_shards: [
    { shard_id: 0, points_count: 120, state: 'Active' },
    { shard_id: 3, points_count: 98, state: 'Active' },
  ],
  remote_shards: [
    { shard_id: 0, peer_id: 2, state: 'Active' },
    { shard_id: 1, peer_id: 2, state: 'Active' },
    { shard_id: 1, peer_id: 3, state: 'Active' },
    { shard_id: 2, peer_id: 3, state: 'Active' },
    { shard_id: 2, peer_id: 4, state: 'Active' },
    { shard_id: 3, peer_id: 4, state: 'Active' },
    { shard_id: 4, peer_id: 2, state: 'Active' },
    { shard_id: 4, peer_id: 3, state: 'Partial' },
    { shard_id: 5, peer_id: 4, state: 'Active' },
    { shard_id: 5, peer_id: 2, state: 'Dead' },
  ],
  shard_transfers: [{ shard_id: 4, from: 2, to: 3, sync: false, method: 'stream_records' }],
};

export const clusterHandlers = [
  http.get(`${BASE_URL}/telemetry`, ({ request }) =>
    ok(
      makeTelemetry({
        hasApiKey: Boolean(request.headers.get('api-key')),
        clusterEnabled: true,
        reshardingEnabled: true,
      })
    )
  ),
  http.get(`${BASE_URL}/cluster`, () => ok(clusterInfo)),
  http.get(`${BASE_URL}/collections/:collection`, () =>
    ok(makeCollectionInfo({ shardNumber: SHARD_COUNT, replicationFactor: REPLICATION_FACTOR }))
  ),
  http.get(`${BASE_URL}/collections/:collection/cluster`, () => ok(collectionClusterInfo)),
];
