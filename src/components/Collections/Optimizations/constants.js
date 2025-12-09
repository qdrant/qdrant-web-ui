export const MOCK_REQUEST_TIME = "2025-12-09T16:10:49.069118878Z";

export const MOCK_DATA = {
  "result": {
    "ongoing": [
      {
        "name": "Segment Optimizing",
        "started_at": "2025-12-09T16:10:35.306209563Z",
        "children": [
          {
            "name": "copy_data",
            "started_at": "2025-12-09T16:10:35.770113084Z",
            "finished_at": "2025-12-09T16:10:36.436875562Z",
            "duration_sec": 0.666761967
          },
          {
            "name": "populate_vector_storages",
            "started_at": "2025-12-09T16:10:36.436877916Z",
            "finished_at": "2025-12-09T16:10:36.448025542Z",
            "duration_sec": 0.011147576
          },
          {
            "name": "wait_cpu_permit",
            "started_at": "2025-12-09T16:10:36.448025652Z",
            "finished_at": "2025-12-09T16:10:36.550934293Z",
            "duration_sec": 0.102908391
          },
          {
            "name": "quantization",
            "started_at": "2025-12-09T16:10:36.762077445Z",
            "finished_at": "2025-12-09T16:10:37.668719603Z",
            "duration_sec": 0.906642008,
            "children": [
              {
                "name": "",
                "started_at": "2025-12-09T16:10:36.762080038Z",
                "finished_at": "2025-12-09T16:10:37.668718551Z",
                "duration_sec": 0.906638102
              }
            ]
          },
          {
            "name": "payload_index",
            "started_at": "2025-12-09T16:10:37.688295820Z",
            "finished_at": "2025-12-09T16:10:39.011844851Z",
            "duration_sec": 1.32354822,
            "children": [
              {
                "name": "text:t",
                "started_at": "2025-12-09T16:10:37.706390813Z",
                "finished_at": "2025-12-09T16:10:39.011844069Z",
                "duration_sec": 1.305452586
              }
            ]
          },
          {
            "name": "vector_index",
            "started_at": "2025-12-09T16:10:39.018015470Z",
            "children": [
              {
                "name": "",
                "started_at": "2025-12-09T16:10:39.018019196Z",
                "children": [
                  {
                    "name": "migrate",
                    "started_at": "2025-12-09T16:10:39.029945562Z",
                    "finished_at": "2025-12-09T16:10:39.069118287Z",
                    "duration_sec": 0.039172585
                  },
                  {
                    "name": "main_graph",
                    "started_at": "2025-12-09T16:10:39.069118878Z",
                    "done": 9207,
                    "total": 17500
                  },
                  {
                    "name": "additional_links",
                    "children": [
                      {
                        "name": "text:t"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "name": "sparse_vector_index"
          }
        ]
      },
    ],
  },
  "status": "ok",
  "time": 0.000049674
};

