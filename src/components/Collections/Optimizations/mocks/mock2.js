export const MOCK_REQUEST_TIME = '2026-01-26T09:41:50.133211280Z';

export const MOCK_DATA = {
  summary: {
    queued_optimizations: 3,
    queued_segments: 3,
    queued_points: 65292,
    idle_segments: 2,
  },
  running: [
    {
      uuid: '4a154889-0f86-4760-98e3-c681833f7483',
      optimizer: 'indexing',
      status: 'optimizing',
      segments: [
        {
          uuid: 'e53e30a3-0e6a-4749-a650-b695bdb09765',
          points_count: 21780,
        },
      ],
      progress: {
        name: 'Segment Optimizing',
        started_at: '2026-01-26T09:39:50.133211280Z',
        children: [
          {
            name: 'copy_data',
            started_at: '2026-01-26T09:39:50.181534055Z',
            finished_at: '2026-01-26T09:39:50.264440300Z',
            duration_sec: 0.08290321,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2026-01-26T09:39:50.264459559Z',
            finished_at: '2026-01-26T09:39:50.264836044Z',
            duration_sec: 0.000376345,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2026-01-26T09:39:50.264836555Z',
          },
        ],
      },
    },
    {
      uuid: 'a0088b1c-baec-4482-af34-634dbee46456',
      optimizer: 'indexing',
      status: 'optimizing',
      segments: [
        {
          uuid: '794765bd-1cec-46a4-a89f-8c906e2b8383',
          points_count: 11144,
        },
      ],
      progress: {
        name: 'Segment Optimizing',
        started_at: '2026-01-26T09:39:49.218016751Z',
        children: [
          {
            name: 'copy_data',
            started_at: '2026-01-26T09:39:49.269991300Z',
            finished_at: '2026-01-26T09:39:49.312097629Z',
            duration_sec: 0.042102502,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2026-01-26T09:39:49.312105230Z',
            finished_at: '2026-01-26T09:39:49.312338791Z',
            duration_sec: 0.000233361,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2026-01-26T09:39:49.312339222Z',
            finished_at: '2026-01-26T09:39:50.132484889Z',
            duration_sec: 0.820145166,
          },
          {
            name: 'quantization',
            started_at: '2026-01-26T09:39:50.180853242Z',
            finished_at: '2026-01-26T09:39:50.180877659Z',
            duration_sec: 0.000022744,
          },
          {
            name: 'payload_index',
            started_at: '2026-01-26T09:39:50.235359624Z',
            finished_at: '2026-01-26T09:39:50.245770831Z',
            duration_sec: 0.010410285,
          },
          {
            name: 'vector_index',
            started_at: '2026-01-26T09:39:50.247922232Z',
            children: [
              {
                name: '',
                started_at: '2026-01-26T09:39:50.247938066Z',
                children: [
                  {
                    name: 'migrate',
                    started_at: '2026-01-26T09:39:50.261874887Z',
                    finished_at: '2026-01-26T09:39:50.261874887Z',
                    duration_sec: 0,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2026-01-26T09:39:50.261876469Z',
                    done: 2750,
                    total: 11144,
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
          },
        ],
      },
    },
  ],
  queued: [
    {
      optimizer: 'indexing',
      segments: [
        {
          uuid: '49239c19-0300-430c-833c-210b841daa3e',
          points_count: 21764,
        },
      ],
    },
    {
      optimizer: 'indexing',
      segments: [
        {
          uuid: '3a387e49-0c88-44a2-a25f-c5957c3ee9ce',
          points_count: 21764,
        },
      ],
    },
    {
      optimizer: 'indexing',
      segments: [
        {
          uuid: '810de74b-c273-4c89-bf97-271a57e9c8e0',
          points_count: 21764,
        },
      ],
    },
  ],
  completed: [
    {
      uuid: '8f7ae58c-ff0c-4c77-bcaf-d29dfe71c632',
      optimizer: 'indexing',
      status: 'done',
      segments: [
        {
          uuid: 'cd75fe20-a556-42d0-92cc-9ba2e5866fe0',
          points_count: 916,
        },
      ],
      progress: {
        name: 'Segment Optimizing',
        started_at: '2026-01-26T09:39:48.346437927Z',
        finished_at: '2026-01-26T09:39:49.901858046Z',
        duration_sec: 1.5554194080000001,
        children: [
          {
            name: 'copy_data',
            started_at: '2026-01-26T09:39:48.393751246Z',
            finished_at: '2026-01-26T09:39:48.397436751Z',
            duration_sec: 0.003684764,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2026-01-26T09:39:48.397441959Z',
            finished_at: '2026-01-26T09:39:48.397554588Z',
            duration_sec: 0.000112509,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2026-01-26T09:39:48.397555048Z',
            finished_at: '2026-01-26T09:39:49.217520325Z',
            duration_sec: 0.819964636,
          },
          {
            name: 'quantization',
            started_at: '2026-01-26T09:39:49.258483717Z',
            finished_at: '2026-01-26T09:39:49.258495906Z',
            duration_sec: 0.000010756,
          },
          {
            name: 'payload_index',
            started_at: '2026-01-26T09:39:49.284925950Z',
            finished_at: '2026-01-26T09:39:49.300616606Z',
            duration_sec: 0.015689304,
          },
          {
            name: 'vector_index',
            started_at: '2026-01-26T09:39:49.302765974Z',
            finished_at: '2026-01-26T09:39:49.865152699Z',
            duration_sec: 0.562386345,
            children: [
              {
                name: '',
                started_at: '2026-01-26T09:39:49.302778643Z',
                finished_at: '2026-01-26T09:39:49.864833660Z',
                duration_sec: 0.562054887,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2026-01-26T09:39:49.304318085Z',
                    finished_at: '2026-01-26T09:39:49.304318085Z',
                    duration_sec: 0,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2026-01-26T09:39:49.304320138Z',
                    finished_at: '2026-01-26T09:39:49.812954114Z',
                    duration_sec: 0.508633795,
                    done: 916,
                    total: 916,
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2026-01-26T09:39:49.865154202Z',
            finished_at: '2026-01-26T09:39:49.865155494Z',
            duration_sec: 0.000001182,
          },
        ],
      },
    },
    {
      uuid: '32cb3dbb-bca0-47ad-80b4-134e132269f9',
      optimizer: 'indexing',
      status: 'done',
      segments: [
        {
          uuid: 'd9754edb-104f-4671-add3-c8056783c23a',
          points_count: 400,
        },
        {
          uuid: '4ff10079-7f2f-4baa-ae7d-c0c8ea1780cc',
          points_count: 400,
        },
      ],
      progress: {
        name: 'Segment Optimizing',
        started_at: '2026-01-26T09:39:48.294296467Z',
        finished_at: '2026-01-26T09:39:48.973212735Z',
        duration_sec: 0.678913504,
        children: [
          {
            name: 'copy_data',
            started_at: '2026-01-26T09:39:48.342634465Z',
            finished_at: '2026-01-26T09:39:48.346156033Z',
            duration_sec: 0.003519796,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2026-01-26T09:39:48.346161622Z',
            finished_at: '2026-01-26T09:39:48.346285127Z',
            duration_sec: 0.000123395,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2026-01-26T09:39:48.346285538Z',
            finished_at: '2026-01-26T09:39:48.346300150Z',
            duration_sec: 0.000014512,
          },
          {
            name: 'quantization',
            started_at: '2026-01-26T09:39:48.372619108Z',
            finished_at: '2026-01-26T09:39:48.372636223Z',
            duration_sec: 0.00001374,
          },
          {
            name: 'payload_index',
            started_at: '2026-01-26T09:39:48.404470825Z',
            finished_at: '2026-01-26T09:39:48.420404405Z',
            duration_sec: 0.015930946,
          },
          {
            name: 'vector_index',
            started_at: '2026-01-26T09:39:48.422575937Z',
            finished_at: '2026-01-26T09:39:48.941287828Z',
            duration_sec: 0.51871119,
            children: [
              {
                name: '',
                started_at: '2026-01-26T09:39:48.422594184Z',
                finished_at: '2026-01-26T09:39:48.941060497Z',
                duration_sec: 0.518466143,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2026-01-26T09:39:48.424718555Z',
                    finished_at: '2026-01-26T09:39:48.424718555Z',
                    duration_sec: 0,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2026-01-26T09:39:48.424720337Z',
                    finished_at: '2026-01-26T09:39:48.882729771Z',
                    duration_sec: 0.458008993,
                    done: 868,
                    total: 868,
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2026-01-26T09:39:48.941289420Z',
            finished_at: '2026-01-26T09:39:48.941290542Z',
            duration_sec: 0.000001001,
          },
        ],
      },
    },
  ],
  idle_segments: [
    {
      uuid: '32cb3dbb-bca0-47ad-80b4-134e132269f9',
      points_count: 868,
    },
    {
      uuid: '8f7ae58c-ff0c-4c77-bcaf-d29dfe71c632',
      points_count: 916,
    },
  ],
};
