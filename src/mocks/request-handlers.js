// these handlers are used in dev:msw mode
// to replace actual api responses
// to run the app with MSW use `npm run dev:msw` command
import { http, HttpResponse } from 'msw';

export const requestHandlers = [
  http.get('http://localhost:6333/cluster', () => {
    return HttpResponse.json({
      result: {
        status: 'enabled',
        peer_id: 1303168285883888,
        peers: {
          6137190655945485: {
            uri: 'http://qdrant_node_follower_4:6335/',
          },
          4261263516753287: {
            uri: 'http://qdrant_node_follower_2:6335/',
          },
          893233296058958: {
            uri: 'http://qdrant_node_follower:6335/',
          },
          1303168285883888: {
            uri: 'http://qdrant_node_1:6335/',
          },
          1681100616435938: {
            uri: 'http://qdrant_node_follower_5:6335/',
          },
          6597152863002314: {
            uri: 'http://qdrant_node_follower_3:6335/',
          },
          6137190655945496: {
            uri: 'http://qdrant_node_follower_6:6335/',
          },
          4261263516753298: {
            uri: 'http://qdrant_node_follower_7:6335/',
          },
          893233296058969: {
            uri: 'http://qdrant_node_follower_8:6335/',
          },
          1303168285883899: {
            uri: 'http://qdrant_node_follower_9:6335/',
          },
          1681100616435949: {
            uri: 'http://qdrant_node_follower_10:6335/',
          },
          6597152863002325: {
            uri: 'http://qdrant_node_follower_11:6335/',
          },
          6137190655945486: {
            uri: 'http://qdrant_node_follower_4:6335/',
          },
          4261263516753288: {
            uri: 'http://qdrant_node_follower_2:6335/',
          },
          893233296058959: {
            uri: 'http://qdrant_node_follower:6335/',
          },
          1303168285883889: {
            uri: 'http://qdrant_node_1:6335/',
          },
          1681100616435939: {
            uri: 'http://qdrant_node_follower_5:6335/',
          },
          6597152863002315: {
            uri: 'http://qdrant_node_follower_3:6335/',
          },
          6137190655945487: {
            uri: 'http://qdrant_node_follower_6:6335/',
          },
          4261263516753289: {
            uri: 'http://qdrant_node_follower_7:6335/',
          },
        },
        raft_info: {
          term: 1,
          commit: 203,
          pending_operations: 0,
          leader: 1303168285883888,
          role: 'Leader',
          is_voter: true,
        },
        consensus_thread_status: {
          consensus_thread_status: 'working',
          last_update: '2025-07-18T11:35:37.631710216Z',
        },
        message_send_failures: {},
      },
      status: 'ok',
      time: {
        source: '7.708e-6',
        parsedValue: 0.000007708,
      },
    });
  }),

  http.get('http://localhost:6333/collections/:collection/cluster', () => {
    return HttpResponse.json({
      result: {
        peer_id: 1303168285883888,
        shard_count: 6,
        local_shards: [
          {
            shard_id: 1,
            points_count: 0,
            state: 'Active',
          },
        ],
        remote_shards: [
          {
            shard_id: 0,
            peer_id: 893233296058958,
            state: 'Active',
          },
          {
            shard_id: 2,
            peer_id: 1681100616435938,
            state: 'Active',
          },
          {
            shard_id: 2,
            shard_key: 'partition 1',
            peer_id: 4261263516753287,
            state: 'Partial',
          },
          {
            shard_id: 3,
            peer_id: 1681100616435938,
            state: 'Active',
          },
          {
            shard_id: 4,
            peer_id: 6597152863002314,
            state: 'Active',
          },
          {
            shard_id: 5,
            peer_id: 6137190655945485,
            state: 'Active',
          },
        ],
        shard_transfers: [
          {
            shard_id: 2,
            from: 1681100616435938,
            to: 4261263516753287,
            sync: false,
            method: 'stream_records',
          },
        ],
      },
      status: 'ok',
      time: 0.000019333,
    });
  }),
];
