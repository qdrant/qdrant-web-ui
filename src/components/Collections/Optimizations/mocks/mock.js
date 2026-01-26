export const MOCK_REQUEST_TIME = '2026-01-26T09:38:03.299522752Z';

export const MOCK_DATA ={
  "summary": {
    "queued_optimizations": 0,
    "queued_segments": 0,
    "queued_points": 0,
    "idle_segments": 2
  },
  "running": [
    {
      "uuid": "f33899a8-cbc9-44b2-b601-f42f1b1241d7",
      "optimizer": "indexing",
      "status": "optimizing",
      "segments": [
        {
          "uuid": "9540957f-ea77-48e6-932b-a425e217bc05",
          "points_count": 364800
        },
        {
          "uuid": "9f31e9b9-285d-44ea-91bf-a8ef545fac9a",
          "points_count": 80068
        }
      ],
      "progress": {
        "name": "Segment Optimizing",
        "started_at": "2026-01-25T18:57:03.299522752Z",
        "children": [
          {
            "name": "copy_data",
            "started_at": "2026-01-25T18:57:03.485638051Z",
            "finished_at": "2026-01-25T18:57:23.948352493Z",
            "duration_sec": 20.462711858
          },
          {
            "name": "populate_vector_storages",
            "started_at": "2026-01-25T18:57:23.948372503Z",
            "finished_at": "2026-01-25T18:57:23.955457669Z",
            "duration_sec": 0.007084916
          },
          {
            "name": "wait_cpu_permit",
            "started_at": "2026-01-25T18:57:23.955458700Z",
            "finished_at": "2026-01-25T18:59:13.238307072Z",
            "duration_sec": 109.28284776
          },
          {
            "name": "quantization",
            "started_at": "2026-01-25T18:59:13.759987330Z",
            "finished_at": "2026-01-25T18:59:13.760031497Z",
            "duration_sec": 0.00003945
          },
          {
            "name": "payload_index",
            "started_at": "2026-01-25T18:59:13.992375436Z",
            "finished_at": "2026-01-25T19:00:07.806072271Z",
            "duration_sec": 53.813695023,
            "children": [
              {
                "name": "text:t",
                "started_at": "2026-01-25T18:59:14.007677456Z",
                "finished_at": "2026-01-25T19:00:07.806064729Z",
                "duration_sec": 53.798386313
              }
            ]
          },
          {
            "name": "vector_index",
            "started_at": "2026-01-25T19:00:07.812203578Z",
            "children": [
              {
                "name": "",
                "started_at": "2026-01-25T19:00:07.812243158Z",
                "children": [
                  {
                    "name": "migrate",
                    "started_at": "2026-01-25T19:00:08.412275678Z",
                    "finished_at": "2026-01-25T19:00:08.791762684Z",
                    "duration_sec": 0.379483622
                  },
                  {
                    "name": "main_graph",
                    "started_at": "2026-01-25T19:00:08.791767312Z",
                    "finished_at": "2026-01-25T19:17:07.522491248Z",
                    "duration_sec": 1018.730723095,
                    "done": 364800,
                    "total": 364800
                  },
                  {
                    "name": "additional_links",
                    "started_at": "2026-01-25T19:17:07.522646331Z",
                    "children": [
                      {
                        "name": "text:t",
                        "started_at": "2026-01-25T19:17:16.172600290Z",
                        "done": 1182981
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
      }
    }
  ],
  "queued": [],
  "completed": [
    {
      "uuid": "de77197a-53d3-4d2f-bb2b-37bd542c5679",
      "optimizer": "indexing",
      "status": "done",
      "segments": [
        {
          "uuid": "550cf0e4-5c7c-4c6b-8cd3-2330da410971",
          "points_count": 54432
        }
      ],
      "progress": {
        "name": "Segment Optimizing",
        "started_at": "2026-01-25T18:53:49.146929719Z",
        "finished_at": "2026-01-25T18:59:13.533129230Z",
        "duration_sec": 324.38619884,
        "children": [
          {
            "name": "copy_data",
            "started_at": "2026-01-25T18:53:49.386495723Z",
            "finished_at": "2026-01-25T18:53:52.013796644Z",
            "duration_sec": 2.627298767
          },
          {
            "name": "populate_vector_storages",
            "started_at": "2026-01-25T18:53:52.013814691Z",
            "finished_at": "2026-01-25T18:53:52.014620263Z",
            "duration_sec": 0.000805331
          },
          {
            "name": "wait_cpu_permit",
            "started_at": "2026-01-25T18:53:52.014620874Z",
            "finished_at": "2026-01-25T18:57:03.299038841Z",
            "duration_sec": 191.284417166
          },
          {
            "name": "quantization",
            "started_at": "2026-01-25T18:57:03.391186059Z",
            "finished_at": "2026-01-25T18:57:03.391221031Z",
            "duration_sec": 0.000031607
          },
          {
            "name": "payload_index",
            "started_at": "2026-01-25T18:57:03.519605759Z",
            "finished_at": "2026-01-25T18:57:10.272059062Z",
            "duration_sec": 6.752452572,
            "children": [
              {
                "name": "text:t",
                "started_at": "2026-01-25T18:57:03.537524386Z",
                "finished_at": "2026-01-25T18:57:10.272046784Z",
                "duration_sec": 6.734521146
              }
            ]
          },
          {
            "name": "vector_index",
            "started_at": "2026-01-25T18:57:10.275489583Z",
            "finished_at": "2026-01-25T18:59:13.187017718Z",
            "duration_sec": 122.911527083,
            "children": [
              {
                "name": "",
                "started_at": "2026-01-25T18:57:10.275511135Z",
                "finished_at": "2026-01-25T18:59:13.185726256Z",
                "duration_sec": 122.910215001,
                "children": [
                  {
                    "name": "migrate",
                    "started_at": "2026-01-25T18:57:10.348404858Z",
                    "finished_at": "2026-01-25T18:57:10.348404858Z",
                    "duration_sec": 0
                  },
                  {
                    "name": "main_graph",
                    "started_at": "2026-01-25T18:57:10.348407792Z",
                    "finished_at": "2026-01-25T18:59:11.776476887Z",
                    "duration_sec": 121.428068344,
                    "done": 55132,
                    "total": 55132
                  },
                  {
                    "name": "additional_links",
                    "started_at": "2026-01-25T18:59:11.776566212Z",
                    "finished_at": "2026-01-25T18:59:12.863036462Z",
                    "duration_sec": 1.08647006,
                    "children": [
                      {
                        "name": "text:t",
                        "started_at": "2026-01-25T18:59:12.861820254Z",
                        "finished_at": "2026-01-25T18:59:12.863017314Z",
                        "duration_sec": 0.001194226,
                        "done": 0
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "name": "sparse_vector_index",
            "started_at": "2026-01-25T18:59:13.187022795Z",
            "finished_at": "2026-01-25T18:59:13.187026331Z",
            "duration_sec": 0.000003436
          }
        ]
      }
    },
    {
      "uuid": "9f31e9b9-285d-44ea-91bf-a8ef545fac9a",
      "optimizer": "indexing",
      "status": "done",
      "segments": [
        {
          "uuid": "c64ebbd2-77ca-4673-b634-fa6158ac6c87",
          "points_count": 40000
        },
        {
          "uuid": "71880e5a-0a10-4216-8838-3a844b633b87",
          "points_count": 40000
        }
      ],
      "progress": {
        "name": "Segment Optimizing",
        "started_at": "2026-01-25T18:53:45.266863683Z",
        "finished_at": "2026-01-25T18:57:03.108204761Z",
        "duration_sec": 197.841339176,
        "children": [
          {
            "name": "copy_data",
            "started_at": "2026-01-25T18:53:45.334554186Z",
            "finished_at": "2026-01-25T18:53:49.144785024Z",
            "duration_sec": 3.810229997
          },
          {
            "name": "populate_vector_storages",
            "started_at": "2026-01-25T18:53:49.144793757Z",
            "finished_at": "2026-01-25T18:53:49.146043266Z",
            "duration_sec": 0.001249309
          },
          {
            "name": "wait_cpu_permit",
            "started_at": "2026-01-25T18:53:49.146043987Z",
            "finished_at": "2026-01-25T18:53:49.146060131Z",
            "duration_sec": 0.000016034
          },
          {
            "name": "quantization",
            "started_at": "2026-01-25T18:53:49.325651615Z",
            "finished_at": "2026-01-25T18:53:49.325665986Z",
            "duration_sec": 0.00001373
          },
          {
            "name": "payload_index",
            "started_at": "2026-01-25T18:53:49.615544093Z",
            "finished_at": "2026-01-25T18:53:59.503393365Z",
            "duration_sec": 9.887848601,
            "children": [
              {
                "name": "text:t",
                "started_at": "2026-01-25T18:53:49.630645280Z",
                "finished_at": "2026-01-25T18:53:59.503381667Z",
                "duration_sec": 9.872734935
              }
            ]
          },
          {
            "name": "vector_index",
            "started_at": "2026-01-25T18:53:59.506120475Z",
            "finished_at": "2026-01-25T18:57:02.669148840Z",
            "duration_sec": 183.163027874,
            "children": [
              {
                "name": "",
                "started_at": "2026-01-25T18:53:59.506143951Z",
                "finished_at": "2026-01-25T18:57:02.668206185Z",
                "duration_sec": 183.162062064,
                "children": [
                  {
                    "name": "migrate",
                    "started_at": "2026-01-25T18:53:59.610304622Z",
                    "finished_at": "2026-01-25T18:53:59.610304622Z",
                    "duration_sec": 0
                  },
                  {
                    "name": "main_graph",
                    "started_at": "2026-01-25T18:53:59.610311272Z",
                    "finished_at": "2026-01-25T18:57:00.671036460Z",
                    "duration_sec": 181.060724307,
                    "done": 80068,
                    "total": 80068
                  },
                  {
                    "name": "additional_links",
                    "started_at": "2026-01-25T18:57:00.671166584Z",
                    "finished_at": "2026-01-25T18:57:02.227447698Z",
                    "duration_sec": 1.556280733,
                    "children": [
                      {
                        "name": "text:t",
                        "started_at": "2026-01-25T18:57:02.226242903Z",
                        "finished_at": "2026-01-25T18:57:02.227430532Z",
                        "duration_sec": 0.001187008,
                        "done": 0
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "name": "sparse_vector_index",
            "started_at": "2026-01-25T18:57:02.669150021Z",
            "finished_at": "2026-01-25T18:57:02.669151744Z",
            "duration_sec": 0.000001613
          }
        ]
      }
    }
  ],
  "idle_segments": [
    {
      "uuid": "de77197a-53d3-4d2f-bb2b-37bd542c5679",
      "points_count": 55132
    },
    {
      "uuid": "9ff58338-aaee-4118-96f8-4c88dd1caff6",
      "points_count": 0
    }
  ]
};
