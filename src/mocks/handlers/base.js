// Base (single-node) handlers: a healthy, non-distributed Qdrant with one small
// collection. Every scenario builds on top of these; variant files in this
// folder override only the endpoints they care about (see cluster.js).
// Don't use these mocks for testing! They're a developer workflow aid.
import { http, HttpResponse } from 'msw';
import { BASE_URL, ok, acknowledged } from '../lib';
import { COLLECTION, POINTS, makeTelemetry, makeCollectionInfo, makeMetrics, singleNodeClusterInfo } from '../data';

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

export const baseHandlers = [
  // --- service / bootstrap ---
  http.get(`${BASE_URL}/telemetry`, ({ request }) =>
    // Accept any string as a valid API key: reporting jwt_rbac as enabled
    // whenever a key is present unlocks the "Access Tokens" page once the user
    // sets a key in the API key dialog (telemetry is refetched on key change).
    ok(makeTelemetry({ hasApiKey: Boolean(request.headers.get('api-key')) }))
  ),

  // Prometheus metrics (Metrics dashboard). Plain text, not the JSON envelope.
  http.get(`${BASE_URL}/metrics`, () => new HttpResponse(makeMetrics(), { headers: { 'Content-Type': 'text/plain' } })),

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

  // --- cluster (single node: distributed mode disabled) ---
  http.get(`${BASE_URL}/cluster`, () => ok({ status: 'disabled' })),

  // --- collections ---
  http.get(`${BASE_URL}/collections`, () => ok({ collections: [{ name: COLLECTION }] })),
  http.get(`${BASE_URL}/aliases`, () => ok({ aliases: [] })),
  http.get(`${BASE_URL}/collections/:collection`, () => ok(makeCollectionInfo())),
  // Only the single mock collection exists; report everything else as absent
  // so the create form doesn't wrongly think new names already exist.
  http.get(`${BASE_URL}/collections/:collection/exists`, ({ params }) =>
    ok({ exists: params.collection === COLLECTION })
  ),
  http.get(`${BASE_URL}/collections/:collection/aliases`, () => ok({ aliases: [] })),
  http.get(`${BASE_URL}/collections/:collection/cluster`, () => ok(singleNodeClusterInfo)),
  // Creating a collection is not supported by this mock. Respond with a clear
  // message instead of pretending it succeeded or hitting the catch-all.
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
  http.get(`${BASE_URL}/collections/:collection/optimizations`, () =>
    ok({
      summary: { queued_optimizations: 0, queued_segments: 0, queued_points: 0, idle_segments: 0 },
      running: [],
      queued: [],
      completed: [],
      idle_segments: [],
    })
  ),
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
];
