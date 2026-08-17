// Shared mock data and builders used across scenarios. Tweak the numbers here
// and every scenario that reuses them stays consistent.
export const COLLECTION = 'demo_collection';
// Every collection the mock instance knows about. More than one so features that
// pick a collection (e.g. the Metrics per-collection scope) can be exercised.
export const COLLECTIONS = [COLLECTION, 'products_index', 'support_docs'];
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

// GET /metrics — Prometheus text exposition format. Values wobble over time so
// the live Metrics dashboard shows movement in mock mode: gauges oscillate
// around a baseline and counters grow monotonically with elapsed time.
// `perCollection` mirrors `/metrics?per_collection=true`: Qdrant then labels the
// request counters with the collection they belong to and stops reporting the
// unlabelled global ones.
export const makeMetrics = ({ clusterEnabled = false, version = '1.15.1', perCollection = false } = {}) => {
  const now = Date.now();
  const t = now / 1000;
  const wobble = (base, amp, periodSec, phase = 0) =>
    Math.round(base + amp * Math.sin((t / periodSec) * 2 * Math.PI + phase));
  const since = Math.floor(now / 1000); // steadily increasing seconds, for counters
  const MB = 1024 * 1024;

  const block = (name, help, type, samples) =>
    [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`, ...samples].join('\n');

  // Monotonic counter value: a baseline plus steady growth, so the dashboard's
  // rate() view shows a roughly constant per-second request rate.
  const counter = (base, rate) => base + Math.floor(since * rate);
  const latSeconds = (baseUs, ampUs, periodSec) => (wobble(baseUs, ampUs, periodSec) / 1e6).toFixed(6);

  // REST endpoints: request counters (mostly 2xx, a few errors), avg latency,
  // and a full duration histogram. `center` is the latency-bucket index the
  // endpoint's requests cluster around, `sigma` the spread — together they
  // shape the histogram so the latency-distribution heatmap has realistic bands.
  const restEndpoints = [
    // CORS preflights: real Qdrant emits these; the dashboard filters them out.
    {
      method: 'OPTIONS',
      endpoint: '/collections/{name}/points',
      rate: 8,
      base: 3200,
      lat: [13, 4, 20],
      center: 0,
      sigma: 0.6,
    },
    { method: 'GET', endpoint: '/collections', rate: 3, base: 1200, lat: [1200, 300, 25], center: 0, sigma: 1 },
    {
      method: 'POST',
      endpoint: '/collections/{name}/points/search',
      rate: 11,
      base: 5400,
      lat: [9000, 2500, 35],
      center: 4,
      sigma: 1.4,
    },
    {
      method: 'PUT',
      endpoint: '/collections/{name}/points',
      rate: 2,
      base: 800,
      lat: [4200, 1200, 30],
      center: 2,
      sigma: 1.2,
    },
    {
      method: 'POST',
      endpoint: '/collections/{name}/points/scroll',
      rate: 1.5,
      base: 640,
      lat: [3100, 900, 28],
      center: 3,
      sigma: 1.2,
    },
    {
      method: 'DELETE',
      endpoint: '/collections/{name}/points',
      rate: 0.4,
      base: 120,
      lat: [2500, 700, 22],
      center: 1,
      sigma: 1,
    },
  ];
  // One stream of request counters per collection when asked for per-collection
  // metrics, otherwise a single unlabelled global stream. Each collection takes a
  // different share of the traffic, so switching collection visibly changes the
  // charts.
  const streams = perCollection
    ? COLLECTIONS.map((name, i) => ({ label: `,collection="${name}"`, scale: [1, 0.45, 0.15][i] ?? 0.1 }))
    : [{ label: '', scale: 1 }];

  // A handful of non-2xx responses so error rate / status breakdowns have variety.
  const restErrors = [
    { method: 'POST', endpoint: '/collections/{name}/points/search', status: '4xx', base: 90, rate: 0.3 },
    { method: 'PUT', endpoint: '/collections/{name}/points', status: '4xx', base: 40, rate: 0.1 },
    { method: 'POST', endpoint: '/collections/{name}/points/search', status: '5xx', base: 6, rate: 0.02 },
  ];
  const restTotal = ({ method, endpoint, status = '2xx', base, rate }, stream) =>
    `rest_responses_total{method="${method}",endpoint="${endpoint}",status="${status}"${stream.label}} ` +
    `${counter(Math.round(base * stream.scale), rate * stream.scale)}`;
  const restTotals = streams.flatMap((stream) => [...restEndpoints, ...restErrors].map((e) => restTotal(e, stream)));
  const restLatency = restEndpoints.map(
    (e) =>
      `rest_responses_avg_duration_seconds{method="${e.method}",endpoint="${e.endpoint}"} ${latSeconds(
        e.lat[0],
        e.lat[1],
        e.lat[2]
      )}`
  );

  // Prometheus histogram: cumulative `_bucket{le}` counts (+ `_sum`, `_count`)
  // per endpoint, per stream (Qdrant labels the histogram per collection too).
  // Counts grow with elapsed time and are spread across buckets by a Gaussian
  // kernel around each endpoint's `center`, so `rate(bucket)` yields a realistic
  // latency-distribution heatmap.
  const LE = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.5, 1, 5, 10, 50];
  const bandCdf = (center, sigma) => {
    const n = LE.length + 1; // finite buckets + "+Inf"
    const weights = Array.from({ length: n }, (_, i) => Math.exp(-((i - center) ** 2) / (2 * sigma * sigma)));
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    return weights.map((w) => (acc += w / total));
  };
  const restHistogram = streams.flatMap((stream) =>
    restEndpoints.flatMap((e) => {
      const count = counter(Math.round(e.base * stream.scale), e.rate * stream.scale);
      const cdf = bandCdf(e.center, e.sigma);
      const labels = `method="${e.method}",endpoint="${e.endpoint}",status="2xx"${stream.label}`;
      const lines = LE.map(
        (le, i) => `rest_responses_duration_seconds_bucket{${labels},le="${le}"} ${Math.round(count * cdf[i])}`
      );
      lines.push(`rest_responses_duration_seconds_bucket{${labels},le="+Inf"} ${count}`);
      lines.push(`rest_responses_duration_seconds_sum{${labels}} ${((count * e.lat[0]) / 1e6).toFixed(6)}`);
      lines.push(`rest_responses_duration_seconds_count{${labels}} ${count}`);
      return lines;
    })
  );

  // gRPC endpoints: request counters and avg latency.
  const grpcEndpoints = [
    { endpoint: '/qdrant.Points/Search', rate: 9, base: 4200, lat: [7000, 2000, 32] },
    { endpoint: '/qdrant.Points/Upsert', rate: 2, base: 900, lat: [3800, 1000, 27] },
    { endpoint: '/qdrant.Collections/Get', rate: 0.5, base: 300, lat: [900, 250, 24] },
  ];
  const grpcTotals = streams.flatMap((stream) =>
    grpcEndpoints.map(
      (e) =>
        `grpc_responses_total{endpoint="${e.endpoint}"${stream.label}} ` +
        `${counter(Math.round(e.base * stream.scale), e.rate * stream.scale)}`
    )
  );
  const grpcLatency = grpcEndpoints.map(
    (e) => `grpc_responses_avg_duration_seconds{endpoint="${e.endpoint}"} ${latSeconds(e.lat[0], e.lat[1], e.lat[2])}`
  );

  return [
    block('app_info', 'information about qdrant server', 'gauge', [`app_info{name="qdrant",version="${version}"} 1`]),
    block('cluster_enabled', 'is cluster support enabled', 'gauge', [`cluster_enabled ${clusterEnabled ? 1 : 0}`]),
    block('cluster_peers_total', 'total number of cluster peers', 'gauge', [
      `cluster_peers_total ${clusterEnabled ? 3 : 1}`,
    ]),
    block('collections_total', 'number of collections', 'gauge', ['collections_total 1']),
    block('collections_vector_total', 'total number of vectors in all collections', 'gauge', [
      `collections_vector_total ${wobble(125000, 400, 45)}`,
    ]),
    block('pending_operations', 'total number of pending operations', 'gauge', [
      `pending_operations ${Math.max(0, wobble(2, 3, 20))}`,
    ]),
    block('memory_active_bytes', 'total number of bytes in active pages', 'gauge', [
      `memory_active_bytes ${wobble(760 * MB, 30 * MB, 40)}`,
    ]),
    block('memory_allocated_bytes', 'total number of bytes allocated by the application', 'gauge', [
      `memory_allocated_bytes ${wobble(910 * MB, 25 * MB, 55, 1)}`,
    ]),
    block('memory_metadata_bytes', 'total number of bytes dedicated to metadata', 'gauge', [
      `memory_metadata_bytes ${wobble(48 * MB, 2 * MB, 60)}`,
    ]),
    block('memory_resident_bytes', 'total number of bytes in physically resident data pages', 'gauge', [
      `memory_resident_bytes ${wobble(830 * MB, 28 * MB, 50, 0.5)}`,
    ]),
    block('memory_retained_bytes', 'total number of bytes in virtual memory mappings', 'gauge', [
      `memory_retained_bytes ${wobble(210 * MB, 12 * MB, 70)}`,
    ]),
    block('rest_responses_total', 'total number of responses through REST API', 'counter', restTotals),
    block('rest_responses_avg_duration_seconds', 'average response duration in REST API', 'gauge', restLatency),
    block('rest_responses_duration_seconds', 'response duration histogram', 'histogram', restHistogram),
    block('grpc_responses_total', 'total number of responses through gRPC API', 'counter', grpcTotals),
    block('grpc_responses_avg_duration_seconds', 'average response duration in gRPC API', 'gauge', grpcLatency),
  ].join('\n');
};

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
