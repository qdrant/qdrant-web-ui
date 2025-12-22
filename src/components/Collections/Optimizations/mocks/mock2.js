export const MOCK_REQUEST_TIME = '2025-12-18T16:36:22.426235334Z';

export const MOCK_DATA = {
  result: {
    ongoing: [
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:35:21.915339532Z',
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:35:21.992537092Z',
            finished_at: '2025-12-18T16:35:22.417619388Z',
            duration_sec: 0.425081656,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:35:22.417622068Z',
            finished_at: '2025-12-18T16:35:22.426234174Z',
            duration_sec: 0.008611826,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:35:22.426235334Z',
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:34:33.117626112Z',
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:34:33.228787778Z',
            finished_at: '2025-12-18T16:34:34.537712174Z',
            duration_sec: 1.308923676,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:34:34.537715214Z',
            finished_at: '2025-12-18T16:34:34.622906001Z',
            duration_sec: 0.085190507,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:34:34.622907041Z',
            finished_at: '2025-12-18T16:35:21.915269532Z',
            duration_sec: 47.292362291,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:35:21.953813512Z',
            finished_at: '2025-12-18T16:35:21.953817432Z',
            duration_sec: 0.00000288,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:35:21.959347703Z',
            finished_at: '2025-12-18T16:35:22.228684643Z',
            duration_sec: 0.26933654,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:35:21.965831773Z',
                finished_at: '2025-12-18T16:35:22.228683163Z',
                duration_sec: 0.26285063,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:35:22.230963999Z',
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:35:22.230970639Z',
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T16:35:22.251814047Z',
                    finished_at: '2025-12-18T16:35:22.480397769Z',
                    duration_sec: 0.228582882,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:35:22.480398489Z',
                    finished_at: '2025-12-18T16:35:41.031801025Z',
                    duration_sec: 18.551402256,
                    done: 5174,
                    total: 5174,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:35:41.031832905Z',
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:35:41.228981119Z',
                        done: 97142,
                      },
                    ],
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
    ],
    completed: [
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:34:31.246508194Z',
        finished_at: '2025-12-18T16:35:20.708446737Z',
        duration_sec: 49.461938263,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:34:31.314732248Z',
            finished_at: '2025-12-18T16:34:31.624140804Z',
            duration_sec: 0.309408156,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:34:31.624143964Z',
            finished_at: '2025-12-18T16:34:31.641689897Z',
            duration_sec: 0.017545693,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:34:31.641691177Z',
            finished_at: '2025-12-18T16:34:31.641709377Z',
            duration_sec: 0.00001812,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:34:31.676397643Z',
            finished_at: '2025-12-18T16:34:31.676400443Z',
            duration_sec: 0.00000236,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:34:31.879132126Z',
            finished_at: '2025-12-18T16:34:31.949192096Z',
            duration_sec: 0.07005961,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:34:31.882762360Z',
                finished_at: '2025-12-18T16:34:31.949190776Z',
                duration_sec: 0.066427896,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:34:31.951951972Z',
            finished_at: '2025-12-18T16:35:20.642157881Z',
            duration_sec: 48.690205709,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:34:31.951957932Z',
                finished_at: '2025-12-18T16:35:20.641429202Z',
                duration_sec: 48.68947115,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T16:34:31.961294918Z',
                    finished_at: '2025-12-18T16:34:54.653824253Z',
                    duration_sec: 22.692528695,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:34:54.653825213Z',
                    finished_at: '2025-12-18T16:35:09.634600128Z',
                    duration_sec: 14.980774595,
                    done: 5168,
                    total: 5168,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:35:09.634630688Z',
                    finished_at: '2025-12-18T16:35:20.581305736Z',
                    duration_sec: 10.946674888,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:35:09.722552510Z',
                        finished_at: '2025-12-18T16:35:20.581301816Z',
                        duration_sec: 10.858748666,
                        done: 10178,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:35:20.642159161Z',
            finished_at: '2025-12-18T16:35:20.642159561Z',
            duration_sec: 2.8e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:19:49.030034669Z',
        finished_at: '2025-12-18T16:28:23.836704378Z',
        duration_sec: 514.806669469,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:19:49.106215032Z',
            finished_at: '2025-12-18T16:19:49.550689519Z',
            duration_sec: 0.444473927,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:19:49.550693039Z',
            finished_at: '2025-12-18T16:19:49.635520985Z',
            duration_sec: 0.084827626,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:19:49.635522545Z',
            finished_at: '2025-12-18T16:26:54.927937494Z',
            duration_sec: 425.292414669,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:26:54.947730061Z',
            finished_at: '2025-12-18T16:26:54.947734221Z',
            duration_sec: 0.00000348,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:26:54.952040653Z',
            finished_at: '2025-12-18T16:26:55.022410413Z',
            duration_sec: 0.070369,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:26:54.955225408Z',
                finished_at: '2025-12-18T16:26:55.022408373Z',
                duration_sec: 0.067182245,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:26:55.024797369Z',
            finished_at: '2025-12-18T16:28:23.766756856Z',
            duration_sec: 88.741959007,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:26:55.024803889Z',
                finished_at: '2025-12-18T16:28:23.765879418Z',
                duration_sec: 88.741075409,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T16:26:55.036128069Z',
                    finished_at: '2025-12-18T16:26:55.060182388Z',
                    duration_sec: 0.024053159,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:26:55.060183268Z',
                    finished_at: '2025-12-18T16:27:56.728346322Z',
                    duration_sec: 61.668162814,
                    done: 24190,
                    total: 24190,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:27:56.728372802Z',
                    finished_at: '2025-12-18T16:28:23.705163481Z',
                    duration_sec: 26.976790479,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:27:56.815135975Z',
                        finished_at: '2025-12-18T16:28:23.705159841Z',
                        duration_sec: 26.890023346,
                        done: 25198,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:28:23.766757656Z',
            finished_at: '2025-12-18T16:28:23.766758216Z',
            duration_sec: 5.2e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:19:04.515432575Z',
        finished_at: '2025-12-18T16:26:53.851423777Z',
        duration_sec: 469.335990882,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:19:04.593809589Z',
            finished_at: '2025-12-18T16:19:05.722434977Z',
            duration_sec: 1.128624508,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:19:05.722437137Z',
            finished_at: '2025-12-18T16:19:05.750979753Z',
            duration_sec: 0.028542296,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:19:05.750981513Z',
            finished_at: '2025-12-18T16:19:49.029972429Z',
            duration_sec: 43.278990636,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:19:49.067996751Z',
            finished_at: '2025-12-18T16:19:49.068000391Z',
            duration_sec: 0.000003,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:19:49.074749657Z',
            finished_at: '2025-12-18T16:19:49.255803685Z',
            duration_sec: 0.181053308,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:19:49.081224564Z',
                finished_at: '2025-12-18T16:19:49.255802165Z',
                duration_sec: 0.174576841,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:19:49.258878239Z',
            finished_at: '2025-12-18T16:26:53.723817515Z',
            duration_sec: 424.464938716,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:19:49.258884119Z',
                finished_at: '2025-12-18T16:26:53.720975400Z',
                duration_sec: 424.462091081,
                children: [
                  {
                    name: 'migrate',
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:19:49.329799413Z',
                    finished_at: '2025-12-18T16:24:09.157620717Z',
                    duration_sec: 259.827820744,
                    done: 105340,
                    total: 105340,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:24:09.157649397Z',
                    finished_at: '2025-12-18T16:26:53.579876762Z',
                    duration_sec: 164.422227165,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:24:09.345461112Z',
                        finished_at: '2025-12-18T16:26:53.579872442Z',
                        duration_sec: 164.23441069,
                        done: 105340,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:26:53.723819075Z',
            finished_at: '2025-12-18T16:26:53.723819395Z',
            duration_sec: 2.8e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:18:12.612884644Z',
        finished_at: '2025-12-18T16:19:47.581887443Z',
        duration_sec: 94.969002479,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:18:12.795653557Z',
            finished_at: '2025-12-18T16:18:13.136060503Z',
            duration_sec: 0.340406426,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:18:13.136063223Z',
            finished_at: '2025-12-18T16:18:13.220986289Z',
            duration_sec: 0.084922706,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:18:13.220987729Z',
            finished_at: '2025-12-18T16:19:04.515349336Z',
            duration_sec: 51.294361167,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:19:04.529922481Z',
            finished_at: '2025-12-18T16:19:04.529926441Z',
            duration_sec: 0.00000328,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:19:04.534579091Z',
            finished_at: '2025-12-18T16:19:04.587749308Z',
            duration_sec: 0.053169737,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:19:04.538311707Z',
                finished_at: '2025-12-18T16:19:04.587747708Z',
                duration_sec: 0.049435001,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:19:04.590291891Z',
            finished_at: '2025-12-18T16:19:47.543669881Z',
            duration_sec: 42.95337687,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:19:04.590299571Z',
                finished_at: '2025-12-18T16:19:47.543262442Z',
                duration_sec: 42.952962751,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T16:19:04.595438298Z',
                    finished_at: '2025-12-18T16:19:04.600764824Z',
                    duration_sec: 0.005325766,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:19:04.600765704Z',
                    finished_at: '2025-12-18T16:19:47.459997653Z',
                    duration_sec: 42.859231669,
                    done: 20192,
                    total: 20192,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:19:47.460023253Z',
                    finished_at: '2025-12-18T16:19:47.500839009Z',
                    duration_sec: 0.040815516,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:19:47.500817529Z',
                        finished_at: '2025-12-18T16:19:47.500836609Z',
                        duration_sec: 0.00001868,
                        done: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:19:47.543670841Z',
            finished_at: '2025-12-18T16:19:47.543671201Z',
            duration_sec: 3.2e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:18:04.805228868Z',
        finished_at: '2025-12-18T16:19:03.753548057Z',
        duration_sec: 58.948318869,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:18:04.934178629Z',
            finished_at: '2025-12-18T16:18:05.317298439Z',
            duration_sec: 0.38311941,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:18:05.317301399Z',
            finished_at: '2025-12-18T16:18:05.335022211Z',
            duration_sec: 0.017720612,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:18:05.335023251Z',
            finished_at: '2025-12-18T16:18:12.612814164Z',
            duration_sec: 7.277790673,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:18:12.638000444Z',
            finished_at: '2025-12-18T16:18:12.638003924Z',
            duration_sec: 0.00000296,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:18:12.737063689Z',
            finished_at: '2025-12-18T16:18:12.793947160Z',
            duration_sec: 0.056883071,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:18:12.743752958Z',
                finished_at: '2025-12-18T16:18:12.793945600Z',
                duration_sec: 0.050192002,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:18:12.796663915Z',
            finished_at: '2025-12-18T16:19:03.712427643Z',
            duration_sec: 50.915763448,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:18:12.796671155Z',
                finished_at: '2025-12-18T16:19:03.712056885Z',
                duration_sec: 50.91538537,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T16:18:12.815492526Z',
                    finished_at: '2025-12-18T16:18:12.820333998Z',
                    duration_sec: 0.004840952,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:18:12.820334838Z',
                    finished_at: '2025-12-18T16:19:03.603238108Z',
                    duration_sec: 50.78290295,
                    done: 19166,
                    total: 19166,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:19:03.603267588Z',
                    finished_at: '2025-12-18T16:19:03.648907253Z',
                    duration_sec: 0.045639385,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:19:03.648885013Z',
                        finished_at: '2025-12-18T16:19:03.648904933Z',
                        duration_sec: 0.00001948,
                        done: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:19:03.712428403Z',
            finished_at: '2025-12-18T16:19:03.712428763Z',
            duration_sec: 2.8e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:17:57.241399749Z',
        finished_at: '2025-12-18T16:18:11.528409866Z',
        duration_sec: 14.287009957,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:17:57.414056401Z',
            finished_at: '2025-12-18T16:17:57.445084113Z',
            duration_sec: 0.031027232,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:17:57.445086073Z',
            finished_at: '2025-12-18T16:17:57.527317785Z',
            duration_sec: 0.082231512,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:17:57.527319065Z',
            finished_at: '2025-12-18T16:18:04.805179668Z',
            duration_sec: 7.277860323,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:18:04.821463403Z',
            finished_at: '2025-12-18T16:18:04.821466763Z',
            duration_sec: 0.00000272,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:18:04.845210806Z',
            finished_at: '2025-12-18T16:18:04.886302143Z',
            duration_sec: 0.041090817,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:18:04.851869796Z',
                finished_at: '2025-12-18T16:18:04.886300503Z',
                duration_sec: 0.034430027,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:18:04.889050379Z',
            finished_at: '2025-12-18T16:18:11.485554573Z',
            duration_sec: 6.596504034,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:18:04.889056819Z',
                finished_at: '2025-12-18T16:18:11.485364053Z',
                duration_sec: 6.596307114,
                children: [
                  {
                    name: 'migrate',
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:18:04.890801736Z',
                    finished_at: '2025-12-18T16:18:11.463165728Z',
                    duration_sec: 6.572363472,
                    done: 5393,
                    total: 5393,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:18:11.463192568Z',
                    finished_at: '2025-12-18T16:18:11.470772796Z',
                    duration_sec: 0.007579908,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:18:11.470754996Z',
                        finished_at: '2025-12-18T16:18:11.470771196Z',
                        duration_sec: 0.00001584,
                        done: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:18:11.485555333Z',
            finished_at: '2025-12-18T16:18:11.485555693Z',
            duration_sec: 2.8e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T16:17:57.153745125Z',
        finished_at: '2025-12-18T16:18:03.066679509Z',
        duration_sec: 5.912934144,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T16:17:57.193165423Z',
            finished_at: '2025-12-18T16:17:57.222252218Z',
            duration_sec: 0.029086275,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T16:17:57.222254098Z',
            finished_at: '2025-12-18T16:17:57.241333349Z',
            duration_sec: 0.019079011,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T16:17:57.241334749Z',
            finished_at: '2025-12-18T16:17:57.241356349Z',
            duration_sec: 0.00002152,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T16:17:57.259744520Z',
            finished_at: '2025-12-18T16:17:57.259747560Z',
            duration_sec: 0.00000244,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T16:17:57.280493928Z',
            finished_at: '2025-12-18T16:17:57.341357994Z',
            duration_sec: 0.060863746,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T16:17:57.287409277Z',
                finished_at: '2025-12-18T16:17:57.341356394Z',
                duration_sec: 0.053946677,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T16:17:57.344165069Z',
            finished_at: '2025-12-18T16:18:03.038555672Z',
            duration_sec: 5.694390323,
            children: [
              {
                name: '',
                started_at: '2025-12-18T16:17:57.344170589Z',
                finished_at: '2025-12-18T16:18:03.038316633Z',
                duration_sec: 5.694145884,
                children: [
                  {
                    name: 'migrate',
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T16:17:57.345591027Z',
                    finished_at: '2025-12-18T16:18:02.920886694Z',
                    duration_sec: 5.5752952669999996,
                    done: 5024,
                    total: 5024,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T16:18:02.920910974Z',
                    finished_at: '2025-12-18T16:18:02.927020484Z',
                    duration_sec: 0.00610931,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T16:18:02.927000604Z',
                        finished_at: '2025-12-18T16:18:02.927018564Z',
                        duration_sec: 0.00001764,
                        done: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T16:18:03.038556232Z',
            finished_at: '2025-12-18T16:18:03.038556832Z',
            duration_sec: 5.6e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T06:19:49.030034669Z',
        finished_at: '2025-12-18T06:28:23.836704378Z',
        duration_sec: 514.806669469,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T06:19:49.106215032Z',
            finished_at: '2025-12-18T06:19:49.550689519Z',
            duration_sec: 0.444473927,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T06:19:49.550693039Z',
            finished_at: '2025-12-18T06:19:49.635520985Z',
            duration_sec: 0.084827626,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T06:19:49.635522545Z',
            finished_at: '2025-12-18T06:26:54.927937494Z',
            duration_sec: 425.292414669,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T06:26:54.947730061Z',
            finished_at: '2025-12-18T06:26:54.947734221Z',
            duration_sec: 0.00000348,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T06:26:54.952040653Z',
            finished_at: '2025-12-18T06:26:55.022410413Z',
            duration_sec: 0.070369,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T06:26:54.955225408Z',
                finished_at: '2025-12-18T06:26:55.022408373Z',
                duration_sec: 0.067182245,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T06:26:55.024797369Z',
            finished_at: '2025-12-18T06:28:23.766756856Z',
            duration_sec: 88.741959007,
            children: [
              {
                name: '',
                started_at: '2025-12-18T06:26:55.024803889Z',
                finished_at: '2025-12-18T06:28:23.765879418Z',
                duration_sec: 88.741075409,
                children: [
                  {
                    name: 'migrate',
                    started_at: '2025-12-18T06:26:55.036128069Z',
                    finished_at: '2025-12-18T06:26:55.060182388Z',
                    duration_sec: 0.024053159,
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T06:26:55.060183268Z',
                    finished_at: '2025-12-18T06:27:56.728346322Z',
                    duration_sec: 61.668162814,
                    done: 24190,
                    total: 24190,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T06:27:56.728372802Z',
                    finished_at: '2025-12-18T06:28:23.705163481Z',
                    duration_sec: 26.976790479,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T06:27:56.815135975Z',
                        finished_at: '2025-12-18T06:28:23.705159841Z',
                        duration_sec: 26.890023346,
                        done: 25198,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T06:28:23.766757656Z',
            finished_at: '2025-12-18T06:28:23.766758216Z',
            duration_sec: 5.2e-7,
          },
        ],
      },
      {
        name: 'Segment Optimizing',
        started_at: '2025-12-18T06:19:04.515432575Z',
        finished_at: '2025-12-18T06:26:53.851423777Z',
        duration_sec: 469.335990882,
        children: [
          {
            name: 'copy_data',
            started_at: '2025-12-18T06:19:04.593809589Z',
            finished_at: '2025-12-18T06:19:05.722434977Z',
            duration_sec: 1.128624508,
          },
          {
            name: 'populate_vector_storages',
            started_at: '2025-12-18T06:19:05.722437137Z',
            finished_at: '2025-12-18T06:19:05.750979753Z',
            duration_sec: 0.028542296,
          },
          {
            name: 'wait_cpu_permit',
            started_at: '2025-12-18T06:19:05.750981513Z',
            finished_at: '2025-12-18T06:19:49.029972429Z',
            duration_sec: 43.278990636,
          },
          {
            name: 'quantization',
            started_at: '2025-12-18T06:19:49.067996751Z',
            finished_at: '2025-12-18T06:19:49.068000391Z',
            duration_sec: 0.000003,
          },
          {
            name: 'payload_index',
            started_at: '2025-12-18T06:19:49.074749657Z',
            finished_at: '2025-12-18T06:19:49.255803685Z',
            duration_sec: 0.181053308,
            children: [
              {
                name: 'keyword:a',
                started_at: '2025-12-18T06:19:49.081224564Z',
                finished_at: '2025-12-18T06:19:49.255802165Z',
                duration_sec: 0.174576841,
              },
            ],
          },
          {
            name: 'vector_index',
            started_at: '2025-12-18T06:19:49.258878239Z',
            finished_at: '2025-12-18T06:26:53.723817515Z',
            duration_sec: 424.464938716,
            children: [
              {
                name: '',
                started_at: '2025-12-18T06:19:49.258884119Z',
                finished_at: '2025-12-18T06:26:53.720975400Z',
                duration_sec: 424.462091081,
                children: [
                  {
                    name: 'migrate',
                  },
                  {
                    name: 'main_graph',
                    started_at: '2025-12-18T06:19:49.329799413Z',
                    finished_at: '2025-12-18T06:24:09.157620717Z',
                    duration_sec: 259.827820744,
                    done: 105340,
                    total: 105340,
                  },
                  {
                    name: 'additional_links',
                    started_at: '2025-12-18T06:24:09.157649397Z',
                    finished_at: '2025-12-18T06:26:53.579876762Z',
                    duration_sec: 164.422227165,
                    children: [
                      {
                        name: 'keyword:a',
                        started_at: '2025-12-18T06:24:09.345461112Z',
                        finished_at: '2025-12-18T06:26:53.579872442Z',
                        duration_sec: 164.23441069,
                        done: 105340,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'sparse_vector_index',
            started_at: '2025-12-18T06:26:53.723819075Z',
            finished_at: '2025-12-18T06:26:53.723819395Z',
            duration_sec: 2.8e-7,
          },
        ],
      },
    ],
  },
  status: 'ok',
  time: 0.000049674,
};
