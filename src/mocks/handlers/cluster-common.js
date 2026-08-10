// Shared helpers for the cluster (distributed) scenarios. Each variant file
// supplies a topology and turns it into the four cluster-related handler
// overrides via makeClusterHandlers.
import { http } from 'msw';
import { BASE_URL, ok } from '../lib';
import { makeTelemetry, makeCollectionInfo } from '../data';

// The cluster-related endpoint overrides for a distributed deployment. Layered
// on top of baseHandlers, these shadow the single-node cluster/telemetry/
// collection handlers.
export function makeClusterHandlers({
  clusterInfo,
  collectionClusterInfo,
  shardNumber,
  replicationFactor,
  reshardingEnabled = false,
}) {
  return [
    http.get(`${BASE_URL}/telemetry`, ({ request }) =>
      ok(
        makeTelemetry({
          hasApiKey: Boolean(request.headers.get('api-key')),
          clusterEnabled: true,
          reshardingEnabled,
        })
      )
    ),
    http.get(`${BASE_URL}/cluster`, () => ok(clusterInfo)),
    http.get(`${BASE_URL}/collections/:collection`, () => ok(makeCollectionInfo({ shardNumber, replicationFactor }))),
    http.get(`${BASE_URL}/collections/:collection/cluster`, () => ok(collectionClusterInfo)),
  ];
}

function makePeers(nodeCount) {
  const peers = {};
  for (let id = 1; id <= nodeCount; id++) {
    peers[id] = { uri: `http://qdrant-node-${id}:6335/` };
  }
  return peers;
}

// Deterministically builds a distributed topology: `shardCount` shards, each
// placed on `replicationFactor` peers, distributed round-robin so peers fill
// evenly. Whenever replicationFactor < nodeCount, most (peer, shard) grid slots
// stay empty — which is what we want the monitor to show. `deadShards` marks
// that many shard replicas Dead for visual variety.
export function generateCluster({ nodeCount, shardCount, replicationFactor, selfPeer = 1, deadShards = 0 }) {
  const clusterInfo = {
    status: 'enabled',
    peer_id: selfPeer,
    peers: makePeers(nodeCount),
    raft_info: { term: 7, commit: 4096, pending_operations: 0, leader: selfPeer, role: 'Leader', is_voter: true },
    consensus_thread_status: { consensus_thread_status: 'working', last_update: '2026-01-01T00:00:00Z' },
    message_send_failures: {},
  };

  const localShards = [];
  const remoteShards = [];
  let placement = 0;
  let deadLeft = deadShards;

  for (let shardId = 0; shardId < shardCount; shardId++) {
    for (let replica = 0; replica < replicationFactor; replica++) {
      const peerId = (placement % nodeCount) + 1; // peers are 1..nodeCount
      placement += 1;

      // Mark a spread-out handful of replicas Dead so the state colours show.
      let state = 'Active';
      if (deadLeft > 0 && replica === replicationFactor - 1 && shardId % 7 === 3) {
        state = 'Dead';
        deadLeft -= 1;
      }

      if (peerId === selfPeer) {
        localShards.push({ shard_id: shardId, points_count: 100 + shardId, state });
      } else {
        remoteShards.push({ shard_id: shardId, peer_id: peerId, state });
      }
    }
  }

  return {
    clusterInfo,
    collectionClusterInfo: {
      peer_id: selfPeer,
      shard_count: shardCount,
      local_shards: localShards,
      remote_shards: remoteShards,
      shard_transfers: [],
    },
    shardNumber: shardCount,
    replicationFactor,
  };
}
