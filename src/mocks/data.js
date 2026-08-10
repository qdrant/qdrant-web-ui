// Shared mock data and builders used across scenarios. Tweak the numbers here
// and every scenario that reuses them stays consistent.
export const COLLECTION = 'demo_collection';
export const VECTOR_SIZE = 4;

// A few points with a simple payload. Enough for the Points tab, faceting,
// similarity search and the graph/visualize views to render something.
export const POINTS = [
  { id: 1, payload: { name: 'Alpha', city: 'Berlin', price: 42 }, vector: [0.12, 0.9, -0.2, 0.05] },
  { id: 2, payload: { name: 'Bravo', city: 'Berlin', price: 17 }, vector: [0.2, 0.85, -0.1, 0.11] },
  { id: 3, payload: { name: 'Charlie', city: 'Lisbon', price: 88 }, vector: [-0.4, 0.1, 0.7, 0.3] },
  { id: 4, payload: { name: 'Delta', city: 'Lisbon', price: 5 }, vector: [-0.35, 0.15, 0.66, 0.28] },
  { id: 5, payload: { name: 'Echo', city: 'Tokyo', price: 63 }, vector: [0.7, -0.3, 0.2, -0.6] },
  { id: 6, payload: { name: 'Foxtrot', city: 'Tokyo', price: 29 }, vector: [0.66, -0.25, 0.18, -0.55] },
  { id: 7, payload: { name: 'Golf', city: 'Oslo', price: 74 }, vector: [-0.1, -0.8, -0.5, 0.4] },
  { id: 8, payload: { name: 'Hotel', city: 'Oslo', price: 51 }, vector: [-0.12, -0.78, -0.48, 0.42] },
];

// Result of GET /telemetry. Only the fields the UI reads are included.
// `hasApiKey` reflects whether a key was sent, which unlocks the Access Tokens
// page (jwt_rbac). The cluster flags switch the Cluster tab between the
// "distributed mode disabled" banner and the live monitor.
export const makeTelemetry = ({ hasApiKey = false, clusterEnabled = false, reshardingEnabled = false } = {}) => ({
  app: { name: 'qdrant', version: '1.15.1', jwt_rbac: hasApiKey, hide_jwt_dashboard: false },
  collections: { number_of_collections: 1, max_collections: null },
  cluster: { enabled: clusterEnabled, resharding_enabled: reshardingEnabled },
});

// Result of GET /collections/{name}. Override shardNumber / replicationFactor
// to match a scenario's cluster topology.
export const makeCollectionInfo = ({ shardNumber = 1, replicationFactor = 1 } = {}) => ({
  status: 'green',
  optimizer_status: { ok: true, error: null },
  indexed_vectors_count: POINTS.length,
  points_count: POINTS.length,
  segments_count: 1,
  config: {
    params: {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      shard_number: shardNumber,
      replication_factor: replicationFactor,
      write_consistency_factor: 1,
      on_disk_payload: false,
    },
    hnsw_config: { m: 16, ef_construct: 100, full_scan_threshold: 10000 },
    optimizer_config: { default_segment_number: 0 },
    quantization_config: null,
  },
  payload_schema: {
    name: { data_type: 'keyword', points: POINTS.length },
    city: { data_type: 'keyword', points: POINTS.length },
    price: { data_type: 'integer', points: POINTS.length },
  },
});

// GET /collections/{name}/cluster for a single-node (non-distributed) instance.
export const singleNodeClusterInfo = {
  peer_id: 0,
  shard_count: 1,
  local_shards: [{ shard_id: 0, points_count: POINTS.length, state: 'Active' }],
  remote_shards: [],
  shard_transfers: [],
};
