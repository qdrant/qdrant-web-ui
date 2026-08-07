// Minimal MSW mock: a single small collection so the whole UI can be
// browsed without a real backend. Enable with `npm run dev:msw`.
// Don't use it for testing purposes!
// it's meant to be used by developers to simplify workflow.
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:6333';
const COLLECTION = 'demo_collection';
const VECTOR_SIZE = 4;

// A few points with a simple payload. Enough for the Points tab, faceting,
// similarity search and the graph/visualize views to render something.
const POINTS = [
  { id: 1, payload: { name: 'Alpha', city: 'Berlin', price: 42 }, vector: [0.12, 0.9, -0.2, 0.05] },
  { id: 2, payload: { name: 'Bravo', city: 'Berlin', price: 17 }, vector: [0.2, 0.85, -0.1, 0.11] },
  { id: 3, payload: { name: 'Charlie', city: 'Lisbon', price: 88 }, vector: [-0.4, 0.1, 0.7, 0.3] },
  { id: 4, payload: { name: 'Delta', city: 'Lisbon', price: 5 }, vector: [-0.35, 0.15, 0.66, 0.28] },
  { id: 5, payload: { name: 'Echo', city: 'Tokyo', price: 63 }, vector: [0.7, -0.3, 0.2, -0.6] },
  { id: 6, payload: { name: 'Foxtrot', city: 'Tokyo', price: 29 }, vector: [0.66, -0.25, 0.18, -0.55] },
  { id: 7, payload: { name: 'Golf', city: 'Oslo', price: 74 }, vector: [-0.1, -0.8, -0.5, 0.4] },
  { id: 8, payload: { name: 'Hotel', city: 'Oslo', price: 51 }, vector: [-0.12, -0.78, -0.48, 0.42] },
];

// Qdrant response envelope.
const ok = (result) => HttpResponse.json({ result, status: 'ok', time: 0.00002 });
const acknowledged = () => ok({ operation_id: 0, status: 'acknowledged' });

const collectionInfo = {
  status: 'green',
  optimizer_status: { ok: true, error: null },
  vectors_count: POINTS.length,
  indexed_vectors_count: POINTS.length,
  points_count: POINTS.length,
  segments_count: 1,
  config: {
    params: {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      shard_number: 1,
      replication_factor: 1,
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
};

// Single-node (distributed mode disabled): one local shard, no peers.
const collectionClusterInfo = {
  peer_id: 0,
  shard_count: 1,
  local_shards: [{ shard_id: 0, points_count: POINTS.length, state: 'Active' }],
  remote_shards: [],
  shard_transfers: [],
};

// Quotas shown on the Settings page. Mutable so that saving in the UI sticks
// for the session. Single node, so usage is reported via `usage` (no `peers`).
const quotas = {
  config: {
    enabled: true,
    max_resident_memory_percent: 80,
    max_disk_usage_percent: 85,
    release_margin_percent: 5,
  },
  usage: {
    resident_memory_percent: 42,
    disk_usage_percent: 61,
  },
  peers: {},
};

export const requestHandlers = [
  // --- service / bootstrap ---
  http.get(`${BASE_URL}/telemetry`, ({ request }) => {
    // Accept any string as a valid API key: reporting jwt_rbac as enabled
    // whenever a key is present unlocks the "Access Tokens" page once the user
    // sets a key in the API key dialog (telemetry is refetched on key change).
    const hasApiKey = Boolean(request.headers.get('api-key'));
    return ok({
      app: { name: 'qdrant', version: '1.15.1', jwt_rbac: hasApiKey, hide_jwt_dashboard: false },
      collections: { number_of_collections: 1, max_collections: null },
      cluster: { enabled: false, resharding_enabled: false },
    });
  }),

  http.get(`${BASE_URL}/issues`, () => ok({ issues: [] })),
  http.delete(`${BASE_URL}/issues`, () => ok(true)),

  // --- quotas (Settings page) ---
  http.get(`${BASE_URL}/quotas`, () => ok(quotas)),
  http.put(`${BASE_URL}/quotas`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    quotas.config = { ...quotas.config, ...body };
    return ok(quotas);
  }),

  // Local Qdrant has no cloud info endpoint; 404 is the expected answer.
  http.get(`${BASE_URL}/cloud/data.json`, () =>
    HttpResponse.json({ status: { error: 'Not found' }, time: 0 }, { status: 404 })
  ),

  // --- cluster ---
  http.get(`${BASE_URL}/cluster`, () => ok({ status: 'disabled' })),

  // --- collections ---
  http.get(`${BASE_URL}/collections`, () => ok({ collections: [{ name: COLLECTION }] })),
  http.get(`${BASE_URL}/aliases`, () => ok({ aliases: [] })),
  http.get(`${BASE_URL}/collections/:collection`, () => ok(collectionInfo)),
  // Only the single mock collection exists; report everything else as absent
  // so the create form doesn't wrongly think new names already exist.
  http.get(`${BASE_URL}/collections/:collection/exists`, ({ params }) =>
    ok({ exists: params.collection === COLLECTION })
  ),
  http.get(`${BASE_URL}/collections/:collection/aliases`, () => ok({ aliases: [] })),
  http.get(`${BASE_URL}/collections/:collection/cluster`, () => ok(collectionClusterInfo)),
  // Creating a collection is not supported by this mock. Respond with a clear
  // message instead of pretending it succeeded or hitting the catch-all below.
  http.put(`${BASE_URL}/collections/:collection`, () =>
    HttpResponse.json(
      { status: { error: 'Creating a collection is not available in the current mock.' }, time: 0 },
      { status: 501, statusText: 'Not available in mock' }
    )
  ),
  http.patch(`${BASE_URL}/collections/:collection`, () => ok(true)),
  http.delete(`${BASE_URL}/collections/:collection`, () => ok(true)),
  http.post(`${BASE_URL}/collections/:collection/cluster`, () => ok(true)),
  http.post(`${BASE_URL}/collections/aliases`, () => ok(true)),

  // --- payload indexes ---
  http.put(`${BASE_URL}/collections/:collection/index`, () => acknowledged()),
  http.delete(`${BASE_URL}/collections/:collection/index/:field`, () => acknowledged()),

  // --- points ---
  http.post(`${BASE_URL}/collections/:collection/points/scroll`, () => ok({ points: POINTS, next_page_offset: null })),

  http.post(`${BASE_URL}/collections/:collection/points/query`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit ?? POINTS.length;
    const points = POINTS.slice(0, limit).map((point, index) => ({
      ...point,
      version: 0,
      score: Math.round((1 - index * 0.05) * 1000) / 1000,
    }));
    return ok({ points });
  }),

  // Retrieve points by id (used by the graph view).
  http.post(`${BASE_URL}/collections/:collection/points`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const ids = body.ids || [];
    return ok(POINTS.filter((point) => ids.includes(point.id)));
  }),

  http.post(`${BASE_URL}/collections/:collection/facet`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const counts = new Map();
    POINTS.forEach((point) => {
      const value = point.payload[body.key];
      if (value !== undefined) counts.set(value, (counts.get(value) || 0) + 1);
    });
    const hits = [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
    return ok({ hits });
  }),

  http.post(`${BASE_URL}/collections/:collection/points/delete`, () => acknowledged()),
  http.post(`${BASE_URL}/collections/:collection/points/payload`, () => acknowledged()),
  http.put(`${BASE_URL}/collections/:collection/points/payload`, () => acknowledged()),

  // Distance matrix samples for the Visualize / Graph tabs: link each point
  // to the next one so the views have something to draw.
  http.post(`${BASE_URL}/collections/:collection/points/search/matrix/offsets`, () => {
    const ids = POINTS.map((point) => point.id);
    const offsetsRow = [];
    const offsetsCol = [];
    const scores = [];
    for (let i = 0; i < POINTS.length - 1; i++) {
      offsetsRow.push(i);
      offsetsCol.push(i + 1);
      scores.push(0.9 - i * 0.05);
    }
    return ok({ offsets_row: offsetsRow, offsets_col: offsetsCol, scores, ids });
  }),

  http.post(`${BASE_URL}/collections/:collection/points/search/matrix/pairs`, () => {
    const pairs = [];
    for (let i = 0; i < POINTS.length - 1; i++) {
      pairs.push({ a: POINTS[i].id, b: POINTS[i + 1].id, score: 0.9 - i * 0.05 });
    }
    return ok({ pairs });
  }),

  // --- optimizations / memory ---
  http.get(`${BASE_URL}/collections/:collection/optimizations`, () => ok({ ongoing: [], completed: [] })),
  http.get(`${BASE_URL}/collections/:collection/memory`, () =>
    ok({
      vectors: [
        {
          name: '',
          storage: { disk_bytes: 4096, ram_bytes: 4096, cached_bytes: 0, expected_cache_bytes: 4096 },
        },
      ],
      payload: { disk_bytes: 2048, ram_bytes: 512, cached_bytes: 0, expected_cache_bytes: 512 },
    })
  ),

  // --- snapshots ---
  http.get(`${BASE_URL}/collections/:collection/snapshots`, () => ok([])),
  http.post(`${BASE_URL}/collections/:collection/snapshots`, () =>
    ok({ name: `${COLLECTION}-snapshot.snapshot`, creation_time: '2026-01-01T00:00:00', size: 1048576 })
  ),
  http.delete(`${BASE_URL}/collections/:collection/snapshots/:snapshot`, () => ok(true)),

  // --- safety net (keep last) ---
  // Any request to the Qdrant origin that no handler above matched is answered
  // locally with a 501 instead of being forwarded. This guarantees mock mode
  // can never read or mutate a real backend running on the same URL — including
  // arbitrary commands typed into the Console or endpoints not yet mocked.
  http.all(`${BASE_URL}/*`, ({ request }) => {
    const { pathname } = new URL(request.url);
    console.warn(`[msw] Blocked un-mocked request in mock mode: ${request.method} ${pathname}`);
    return HttpResponse.json(
      {
        status: {
          error: `Not mocked: ${request.method} ${pathname} is not handled in MSW mock mode, so it was not sent to a real backend.`,
        },
        time: 0,
      },
      { status: 501 }
    );
  }),
];
