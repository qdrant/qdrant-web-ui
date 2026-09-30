// Big cluster scenario: 30 nodes, 150 shards, replication factor 2 — so each
// node holds 10 shard replicas ("10 shards per node"). Since each shard lives on
// only 2 of the 30 peers, the vast majority of grid slots are empty. A hard-to-
// reproduce-on-a-dev-machine topology for stress-testing the Cluster monitor.
// A few shard transfers run as well, to check how their arrows fit on narrow
// slots: between neighbouring peers, from the local peer (the only one of them
// with a progress comment, since only a peer taking part reports one) and
// across most of the cluster.
//
// Run with `npm run dev:msw -- cluster-big`.
import { generateCluster, makeClusterHandlers } from './cluster-common';

const topology = generateCluster({
  nodeCount: 30,
  shardCount: 150,
  replicationFactor: 2,
  deadShards: 3,
});

// Shards are placed round-robin, so shard N lives on peers 2N+1 and 2N+2 (mod 30).
const TRANSFERS = [
  {
    shard_id: 0,
    from: 1,
    to: 3,
    sync: false,
    method: 'stream_records',
    comment: 'transferring (8.21s) | Transferring records (4100/10000), ETA: 11.80s | read: 0.90s, send: 2.10s',
  },
  { shard_id: 1, from: 4, to: 5, sync: true, method: 'wal_delta' },
  { shard_id: 2, from: 6, to: 28, sync: false, method: 'snapshot' },
];

topology.collectionClusterInfo.shard_transfers = TRANSFERS;
topology.collectionClusterInfo.remote_shards.push(
  ...TRANSFERS.map(({ shard_id: shardId, to }) => ({ shard_id: shardId, peer_id: to, state: 'Partial' }))
);

export const clusterBigHandlers = makeClusterHandlers(topology);
