// Optimizations scenario: a rich GET /collections/{name}/optimizations response
// Run with `npm run dev:msw -- optimizations`.
import { http } from 'msw';
import { BASE_URL, ok } from '../lib';

function buildOptimizations() {
  const now = Date.now();
  const iso = (secAgo) => new Date(now - secAgo * 1000).toISOString();
  const seg = (uuid, pointsCount) => ({ uuid, points_count: pointsCount });

  return {
    summary: {
      queued_optimizations: 2,
      queued_segments: 3,
      queued_points: 200000,
      idle_segments: 3,
    },
    running: [
      {
        uuid: 'd1000000-0000-4000-8000-000000000001',
        optimizer: 'indexing',
        status: 'optimizing',
        segments: [
          seg('a1000000-0000-4000-8000-000000000001', 120000),
          seg('a1000000-0000-4000-8000-000000000002', 90000),
        ],
        progress: {
          name: 'Segment Optimizing',
          started_at: iso(300),
          children: [
            { name: 'copy_data', started_at: iso(300), finished_at: iso(278), duration_sec: 22 },
            {
              name: 'indexing',
              started_at: iso(278),
              children: [{ name: 'main_graph', started_at: iso(278), done: 90000, total: 150000 }],
            },
          ],
        },
      },
      {
        uuid: 'd1000000-0000-4000-8000-000000000002',
        optimizer: 'indexing',
        status: 'optimizing',
        segments: [seg('a1000000-0000-4000-8000-000000000003', 80000)],
        progress: {
          name: 'Segment Optimizing',
          started_at: iso(150),
          children: [
            { name: 'copy_data', started_at: iso(150), finished_at: iso(131), duration_sec: 19 },
            {
              name: 'indexing',
              started_at: iso(131),
              children: [{ name: 'main_graph', started_at: iso(131), done: 30000, total: 120000 }],
            },
          ],
        },
      },
    ],
    queued: [
      {
        optimizer: 'indexing',
        segments: [
          seg('a2000000-0000-4000-8000-000000000001', 70000),
          seg('a2000000-0000-4000-8000-000000000002', 50000),
        ],
      },
      {
        optimizer: 'indexing',
        segments: [seg('a2000000-0000-4000-8000-000000000003', 80000)],
      },
    ],
    completed: [
      {
        uuid: 'd3000000-0000-4000-8000-000000000001',
        optimizer: 'indexing',
        status: 'done',
        segments: [
          seg('a3000000-0000-4000-8000-000000000001', 90000),
          seg('a3000000-0000-4000-8000-000000000002', 60000),
        ],
        progress: {
          name: 'Segment Optimizing',
          started_at: iso(540),
          finished_at: iso(360),
          duration_sec: 180,
          children: [
            { name: 'copy_data', started_at: iso(540), finished_at: iso(518), duration_sec: 22 },
            {
              name: 'indexing',
              started_at: iso(518),
              finished_at: iso(400),
              duration_sec: 118,
              children: [
                {
                  name: 'main_graph',
                  started_at: iso(518),
                  finished_at: iso(400),
                  duration_sec: 118,
                  done: 150000,
                  total: 150000,
                },
              ],
            },
            { name: 'finalize', started_at: iso(400), finished_at: iso(360), duration_sec: 40 },
          ],
        },
      },
      {
        uuid: 'd3000000-0000-4000-8000-000000000002',
        optimizer: 'indexing',
        status: 'done',
        segments: [seg('a3000000-0000-4000-8000-000000000003', 110000)],
        progress: {
          name: 'Segment Optimizing',
          started_at: iso(420),
          finished_at: iso(210),
          duration_sec: 210,
          children: [
            { name: 'copy_data', started_at: iso(420), finished_at: iso(395), duration_sec: 25 },
            {
              name: 'indexing',
              started_at: iso(395),
              finished_at: iso(245),
              duration_sec: 150,
              children: [
                {
                  name: 'main_graph',
                  started_at: iso(395),
                  finished_at: iso(245),
                  duration_sec: 150,
                  done: 110000,
                  total: 110000,
                },
              ],
            },
            { name: 'finalize', started_at: iso(245), finished_at: iso(210), duration_sec: 35 },
          ],
        },
      },
    ],
    idle_segments: [
      seg('a4000000-0000-4000-8000-000000000001', 100000),
      seg('a4000000-0000-4000-8000-000000000002', 95000),
      seg('a4000000-0000-4000-8000-000000000003', 88000),
    ],
  };
}

export const optimizationsHandlers = [
  http.get(`${BASE_URL}/collections/:collection/optimizations`, () => ok(buildOptimizations())),
];
