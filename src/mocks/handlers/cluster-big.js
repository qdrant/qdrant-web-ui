// Big cluster scenario: 30 nodes, 150 shards, replication factor 2 — so each
// node holds 10 shard replicas ("10 shards per node"). Since each shard lives on
// only 2 of the 30 peers, the vast majority of grid slots are empty. A hard-to-
// reproduce-on-a-dev-machine topology for stress-testing the Cluster monitor.
//
// Run with `npm run dev:msw -- cluster-big`.
import { generateCluster, makeClusterHandlers } from './cluster-common';

const topology = generateCluster({
  nodeCount: 30,
  shardCount: 150,
  replicationFactor: 2,
  deadShards: 3,
});

export const clusterBigHandlers = makeClusterHandlers(topology);
