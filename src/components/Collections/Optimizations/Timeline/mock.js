export const MOCK_REQUEST_TIME = '2025-12-09T16:10:49.069118878Z';

export const MOCK_DATA = {
  ongoing: [
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:36.924189701Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:37.363712007Z',
          finished_at: '2025-12-09T16:10:37.593076410Z',
          duration_sec: 0.229363632,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:37.593079485Z',
          finished_at: '2025-12-09T16:10:37.607129561Z',
          duration_sec: 0.014049916,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:37.607130693Z',
          finished_at: '2025-12-09T16:10:39.246556978Z',
          duration_sec: 1.6394257030000001,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:39.334062299Z',
          finished_at: '2025-12-09T16:10:39.611846900Z',
          duration_sec: 0.27778387,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:39.334066345Z',
              finished_at: '2025-12-09T16:10:39.611845709Z',
              duration_sec: 0.277778903,
            },
          ],
        },
        {
          name: 'payload_index',
          children: [
            {
              name: 'text:t',
            },
          ],
        },
        {
          name: 'vector_index',
        },
        {
          name: 'sparse_vector_index',
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:35.306209563Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:35.770113084Z',
          finished_at: '2025-12-09T16:10:36.436875562Z',
          duration_sec: 0.666761967,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:36.436877916Z',
          finished_at: '2025-12-09T16:10:36.448025542Z',
          duration_sec: 0.011147576,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:36.448025652Z',
          finished_at: '2025-12-09T16:10:36.550934293Z',
          duration_sec: 0.102908391,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:36.762077445Z',
          finished_at: '2025-12-09T16:10:37.668719603Z',
          duration_sec: 0.906642008,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:36.762080038Z',
              finished_at: '2025-12-09T16:10:37.668718551Z',
              duration_sec: 0.906638102,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:37.688295820Z',
          finished_at: '2025-12-09T16:10:39.011844851Z',
          duration_sec: 1.32354822,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:37.706390813Z',
              finished_at: '2025-12-09T16:10:39.011844069Z',
              duration_sec: 1.305452586,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:39.018015470Z',
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:39.018019196Z',
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:39.029945562Z',
                  finished_at: '2025-12-09T16:10:39.069118287Z',
                  duration_sec: 0.039172585,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:39.069118878Z',
                  done: 9207,
                  total: 17500,
                },
                {
                  name: 'additional_links',
                  children: [
                    {
                      name: 'text:t',
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
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:34.629644540Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:35.075906920Z',
          finished_at: '2025-12-09T16:10:35.284807102Z',
          duration_sec: 0.208899972,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:35.284809736Z',
          finished_at: '2025-12-09T16:10:35.296951536Z',
          duration_sec: 0.012141629,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:35.296952407Z',
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:33.950566501Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:34.306719678Z',
          finished_at: '2025-12-09T16:10:34.852567136Z',
          duration_sec: 0.545846627,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:34.852569520Z',
          finished_at: '2025-12-09T16:10:34.864941786Z',
          duration_sec: 0.012372206,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:34.864942136Z',
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:32.551980820Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:32.988106212Z',
          finished_at: '2025-12-09T16:10:33.625002245Z',
          duration_sec: 0.636895843,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:33.625004879Z',
          finished_at: '2025-12-09T16:10:33.639346102Z',
          duration_sec: 0.014341143,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:33.639347013Z',
          finished_at: '2025-12-09T16:10:33.639358110Z',
          duration_sec: 0.000011036,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:33.892146472Z',
          finished_at: '2025-12-09T16:10:34.783325481Z',
          duration_sec: 0.891178318,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:33.892159461Z',
              finished_at: '2025-12-09T16:10:34.783324610Z',
              duration_sec: 0.891164959,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:34.828553323Z',
          finished_at: '2025-12-09T16:10:36.407761046Z',
          duration_sec: 1.5792076430000002,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:34.882829577Z',
              finished_at: '2025-12-09T16:10:36.407759784Z',
              duration_sec: 1.524930027,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:36.452088496Z',
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:36.452095015Z',
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:36.468768472Z',
                  finished_at: '2025-12-09T16:10:36.539367727Z',
                  duration_sec: 0.070598334,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:36.539368969Z',
                  finished_at: '2025-12-09T16:10:37.912756247Z',
                  duration_sec: 1.373386928,
                  done: 22400,
                  total: 22400,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:37.912758651Z',
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:38.002574553Z',
                      done: 67199,
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
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:31.911827013Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:32.338854579Z',
          finished_at: '2025-12-09T16:10:32.964195724Z',
          duration_sec: 0.625340795,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:32.964197687Z',
          finished_at: '2025-12-09T16:10:32.974622667Z',
          duration_sec: 0.01042493,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:32.974623038Z',
          finished_at: '2025-12-09T16:10:32.974627624Z',
          duration_sec: 0.000004536,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:33.263885170Z',
          finished_at: '2025-12-09T16:10:34.299463558Z',
          duration_sec: 1.035578137,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:33.263888085Z',
              finished_at: '2025-12-09T16:10:34.299462006Z',
              duration_sec: 1.03557351,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:34.351429912Z',
          finished_at: '2025-12-09T16:10:35.845459240Z',
          duration_sec: 1.494028436,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:34.393720091Z',
              finished_at: '2025-12-09T16:10:35.845458269Z',
              duration_sec: 1.451737136,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:35.866442021Z',
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:35.866447139Z',
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:35.886031248Z',
                  finished_at: '2025-12-09T16:10:35.985758509Z',
                  duration_sec: 0.09972599,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:35.985761183Z',
                  finished_at: '2025-12-09T16:10:37.827519333Z',
                  duration_sec: 1.84175786,
                  done: 24500,
                  total: 24500,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:37.827522408Z',
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:37.939376697Z',
                      done: 58019,
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
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:29.587191620Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:29.915553118Z',
          finished_at: '2025-12-09T16:10:30.631540372Z',
          duration_sec: 0.715985952,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:30.631543717Z',
          finished_at: '2025-12-09T16:10:30.647905406Z',
          duration_sec: 0.016361609,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:30.647906257Z',
          finished_at: '2025-12-09T16:10:30.647909152Z',
          duration_sec: 0.000002835,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:30.850380066Z',
          finished_at: '2025-12-09T16:10:31.970432221Z',
          duration_sec: 1.120051805,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:30.850383160Z',
              finished_at: '2025-12-09T16:10:31.970431440Z',
              duration_sec: 1.120048049,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:32.019548023Z',
          finished_at: '2025-12-09T16:10:33.387371273Z',
          duration_sec: 1.36782315,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:32.065366863Z',
              finished_at: '2025-12-09T16:10:33.387370812Z',
              duration_sec: 1.322003819,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:33.419854930Z',
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:33.419859567Z',
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:33.432044261Z',
                  finished_at: '2025-12-09T16:10:33.471431048Z',
                  duration_sec: 0.039386657,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:33.471431429Z',
                  finished_at: '2025-12-09T16:10:34.571684531Z',
                  duration_sec: 1.100252862,
                  done: 16100,
                  total: 16100,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:34.571687686Z',
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:34.654819979Z',
                      done: 207047,
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
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:27.521375598Z',
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:27.834881039Z',
          finished_at: '2025-12-09T16:10:28.382496163Z',
          duration_sec: 0.547614603,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:28.382499137Z',
          finished_at: '2025-12-09T16:10:28.399499074Z',
          duration_sec: 0.016999877,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:28.399499956Z',
          finished_at: '2025-12-09T16:10:39.678963383Z',
          duration_sec: 11.279463197,
        },
        {
          name: 'quantization',
        },
        {
          name: 'payload_index',
          children: [
            {
              name: 'text:t',
            },
          ],
        },
        {
          name: 'vector_index',
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
      started_at: '2025-12-09T16:10:36.927750140Z',
      finished_at: '2025-12-09T16:10:37.279261484Z',
      duration_sec: 0.351510983,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:36.168386916Z',
      finished_at: '2025-12-09T16:10:39.167438285Z',
      duration_sec: 2.9990507280000003,
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:36.622881723Z',
          finished_at: '2025-12-09T16:10:36.745550557Z',
          duration_sec: 0.122668363,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:36.745553131Z',
          finished_at: '2025-12-09T16:10:36.752032815Z',
          duration_sec: 0.006479624,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:36.752033787Z',
          finished_at: '2025-12-09T16:10:37.572008352Z',
          duration_sec: 0.819973984,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:37.669675328Z',
          finished_at: '2025-12-09T16:10:38.009603402Z',
          duration_sec: 0.339927433,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:37.669678423Z',
              finished_at: '2025-12-09T16:10:38.009602561Z',
              duration_sec: 0.339923988,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:38.027293627Z',
          finished_at: '2025-12-09T16:10:38.390272628Z',
          duration_sec: 0.362978651,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:38.043206020Z',
              finished_at: '2025-12-09T16:10:38.390271396Z',
              duration_sec: 0.347064825,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:38.394891937Z',
          finished_at: '2025-12-09T16:10:39.099842101Z',
          duration_sec: 0.704950024,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:38.394899318Z',
              finished_at: '2025-12-09T16:10:39.097746663Z',
              duration_sec: 0.702847285,
              children: [
                {
                  name: 'migrate',
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:38.398339466Z',
                  finished_at: '2025-12-09T16:10:39.029507003Z',
                  duration_sec: 0.631167297,
                  done: 19600,
                  total: 19600,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:39.029508125Z',
                  finished_at: '2025-12-09T16:10:39.038188504Z',
                  duration_sec: 0.008680339,
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:39.037936045Z',
                      finished_at: '2025-12-09T16:10:39.038186602Z',
                      duration_sec: 0.000250466,
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
          started_at: '2025-12-09T16:10:39.099842652Z',
          finished_at: '2025-12-09T16:10:39.099842852Z',
          duration_sec: 1.4e-7,
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:35.308954807Z',
      finished_at: '2025-12-09T16:10:35.682347372Z',
      duration_sec: 0.373392024,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:34.661948857Z',
      finished_at: '2025-12-09T16:10:34.953174440Z',
      duration_sec: 0.291225052,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:34.632194791Z',
      finished_at: '2025-12-09T16:10:34.953145446Z',
      duration_sec: 0.320950385,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:34.008747191Z',
      finished_at: '2025-12-09T16:10:34.218148035Z',
      duration_sec: 0.209400744,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:33.958253498Z',
      finished_at: '2025-12-09T16:10:34.218008155Z',
      duration_sec: 0.259754236,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:33.265462760Z',
      finished_at: '2025-12-09T16:10:36.732621696Z',
      duration_sec: 3.467158705,
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:33.620870578Z',
          finished_at: '2025-12-09T16:10:33.861965854Z',
          duration_sec: 0.241094374,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:33.861969670Z',
          finished_at: '2025-12-09T16:10:33.870656219Z',
          duration_sec: 0.008686388,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:33.870657260Z',
          finished_at: '2025-12-09T16:10:33.870662278Z',
          duration_sec: 0.000004968,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:34.023722326Z',
          finished_at: '2025-12-09T16:10:34.400529681Z',
          duration_sec: 0.376806654,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:34.023726202Z',
              finished_at: '2025-12-09T16:10:34.400528659Z',
              duration_sec: 0.376802217,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:34.538936197Z',
          finished_at: '2025-12-09T16:10:35.237850363Z',
          duration_sec: 0.698914026,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:34.584062005Z',
              finished_at: '2025-12-09T16:10:35.237849522Z',
              duration_sec: 0.653787287,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:35.243455053Z',
          finished_at: '2025-12-09T16:10:36.569772522Z',
          duration_sec: 1.326317229,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:35.243458959Z',
              finished_at: '2025-12-09T16:10:36.565167454Z',
              duration_sec: 1.321708425,
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:35.247910295Z',
                  finished_at: '2025-12-09T16:10:35.256364145Z',
                  duration_sec: 0.008453669,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:35.256364465Z',
                  finished_at: '2025-12-09T16:10:36.363726497Z',
                  duration_sec: 1.1073616020000001,
                  done: 18900,
                  total: 18900,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:36.363729181Z',
                  finished_at: '2025-12-09T16:10:36.410590347Z',
                  duration_sec: 0.046861096,
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:36.410142834Z',
                      finished_at: '2025-12-09T16:10:36.410587562Z',
                      duration_sec: 0.000444247,
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
          started_at: '2025-12-09T16:10:36.569772912Z',
          finished_at: '2025-12-09T16:10:36.569773343Z',
          duration_sec: 3.71e-7,
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:32.198864084Z',
      finished_at: '2025-12-09T16:10:32.252517072Z',
      duration_sec: 0.053652898,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:31.245379919Z',
      finished_at: '2025-12-09T16:10:31.569873367Z',
      duration_sec: 0.324492807,
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:26.801980154Z',
      finished_at: '2025-12-09T16:10:38.736532714Z',
      duration_sec: 11.93455245,
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:27.150889960Z',
          finished_at: '2025-12-09T16:10:27.391288429Z',
          duration_sec: 0.240397558,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:27.391292525Z',
          finished_at: '2025-12-09T16:10:27.402854594Z',
          duration_sec: 0.011561839,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:27.402856136Z',
          finished_at: '2025-12-09T16:10:36.680695331Z',
          duration_sec: 9.277838925,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:36.774719706Z',
          finished_at: '2025-12-09T16:10:37.168900749Z',
          duration_sec: 0.394180432,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:36.774723772Z',
              finished_at: '2025-12-09T16:10:37.168899427Z',
              duration_sec: 0.394175365,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:37.217492324Z',
          finished_at: '2025-12-09T16:10:38.009545055Z',
          duration_sec: 0.79205225,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:37.262383891Z',
              finished_at: '2025-12-09T16:10:38.009544223Z',
              duration_sec: 0.747159532,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:38.026341636Z',
          finished_at: '2025-12-09T16:10:38.661803114Z',
          duration_sec: 0.635461247,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:38.026346023Z',
              finished_at: '2025-12-09T16:10:38.657643916Z',
              duration_sec: 0.631297813,
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:38.031040545Z',
                  finished_at: '2025-12-09T16:10:38.037368441Z',
                  duration_sec: 0.006327245,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:38.037368692Z',
                  finished_at: '2025-12-09T16:10:38.561041218Z',
                  duration_sec: 0.523672336,
                  done: 17000,
                  total: 17000,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:38.561043582Z',
                  finished_at: '2025-12-09T16:10:38.581021773Z',
                  duration_sec: 0.019978131,
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:38.580751137Z',
                      finished_at: '2025-12-09T16:10:38.581019259Z',
                      duration_sec: 0.000267401,
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
          started_at: '2025-12-09T16:10:38.661803314Z',
          finished_at: '2025-12-09T16:10:38.661803675Z',
          duration_sec: 3.11e-7,
        },
      ],
    },
    {
      name: 'Segment Optimizing',
      started_at: '2025-12-09T16:10:24.530191567Z',
      finished_at: '2025-12-09T16:10:37.537321635Z',
      duration_sec: 13.007128466,
      children: [
        {
          name: 'copy_data',
          started_at: '2025-12-09T16:10:24.931241959Z',
          finished_at: '2025-12-09T16:10:25.488363584Z',
          duration_sec: 0.557121294,
        },
        {
          name: 'populate_vector_storages',
          started_at: '2025-12-09T16:10:25.488365607Z',
          finished_at: '2025-12-09T16:10:25.504900636Z',
          duration_sec: 0.016534759,
        },
        {
          name: 'wait_cpu_permit',
          started_at: '2025-12-09T16:10:25.504902048Z',
          finished_at: '2025-12-09T16:10:26.324803343Z',
          duration_sec: 0.819900844,
        },
        {
          name: 'quantization',
          started_at: '2025-12-09T16:10:26.477832245Z',
          finished_at: '2025-12-09T16:10:27.580563340Z',
          duration_sec: 1.102730504,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:26.477836241Z',
              finished_at: '2025-12-09T16:10:27.580561898Z',
              duration_sec: 1.102725316,
            },
          ],
        },
        {
          name: 'payload_index',
          started_at: '2025-12-09T16:10:27.621366104Z',
          finished_at: '2025-12-09T16:10:29.062553703Z',
          duration_sec: 1.441186908,
          children: [
            {
              name: 'text:t',
              started_at: '2025-12-09T16:10:27.663052776Z',
              finished_at: '2025-12-09T16:10:29.062553082Z',
              duration_sec: 1.3995001550000001,
            },
          ],
        },
        {
          name: 'vector_index',
          started_at: '2025-12-09T16:10:29.100085033Z',
          finished_at: '2025-12-09T16:10:37.335282690Z',
          duration_sec: 8.235197527,
          children: [
            {
              name: '',
              started_at: '2025-12-09T16:10:29.100089990Z',
              finished_at: '2025-12-09T16:10:37.323710156Z',
              duration_sec: 8.223620106,
              children: [
                {
                  name: 'migrate',
                  started_at: '2025-12-09T16:10:29.112264969Z',
                  finished_at: '2025-12-09T16:10:29.163798994Z',
                  duration_sec: 0.051533914,
                },
                {
                  name: 'main_graph',
                  started_at: '2025-12-09T16:10:29.163799145Z',
                  finished_at: '2025-12-09T16:10:31.286049674Z',
                  duration_sec: 2.122250228,
                  done: 20700,
                  total: 20700,
                },
                {
                  name: 'additional_links',
                  started_at: '2025-12-09T16:10:31.286052027Z',
                  finished_at: '2025-12-09T16:10:37.121374384Z',
                  duration_sec: 5.835322297,
                  children: [
                    {
                      name: 'text:t',
                      started_at: '2025-12-09T16:10:31.394155852Z',
                      finished_at: '2025-12-09T16:10:37.121371620Z',
                      duration_sec: 5.727215187,
                      done: 171261,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'sparse_vector_index',
          started_at: '2025-12-09T16:10:37.335283221Z',
          finished_at: '2025-12-09T16:10:37.335283741Z',
          duration_sec: 4.7e-7,
        },
      ],
    },
  ],
};
