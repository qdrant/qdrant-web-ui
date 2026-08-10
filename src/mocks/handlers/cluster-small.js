// Small cluster scenario: 2 nodes, 4 shards, replication factor 1 — so each
// shard lives on a single node and every shard row has one empty slot on the
// other node. One shard replica is Dead. Handy for the compact-cluster layout.
//
// Run with `npm run dev:msw -- cluster-small`.
import { generateCluster, makeClusterHandlers } from './cluster-common';

const topology = generateCluster({
  nodeCount: 2,
  shardCount: 4,
  replicationFactor: 1,
  deadShards: 1,
});

export const clusterSmallHandlers = makeClusterHandlers(topology);
