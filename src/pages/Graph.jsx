import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { alpha, Paper, Box, Tooltip, Typography, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import GraphVisualisation from '../components/GraphVisualisation/GraphVisualisation';
import { useWindowResize } from '../hooks/windowHooks';
import PointPreview from '../components/Common/PointPreview';
import CodeEditorWindow from '../components/FilterEditorWindow';
import { useClient } from '../context/client-context';
import { getFirstPoint, getSamplePoints } from '../lib/graph-visualization-helpers';
import { useSnackbar } from 'notistack';

const explanation = `

// Parameters for expansion request:
//
// Available parameters:
//
// - 'limit': number of records to use on each step.
// - 'sample': bootstrap graph with sample data from collection.
//
// - 'filter': filter expression to select vectors for visualization.
//             See https://qdrant.tech/documentation/concepts/filtering/
//
// - 'using': specify which vector to use for visualization
//                  if there are multiple.
//
// - 'tree': if true, will use show spanning tree instead of full graph.

`;

const defaultJson = `
// Try me!

{
  "limit": 5
}
`;

const defaultQuery = defaultJson + explanation;

function Graph() {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { newInitNode, vectorName } = location.state || {};
  const [initNode, setInitNode] = useState(null);
  const [sampleLinks, setSampleLinks] = useState(null);

  const [options, setOptions] = useState({
    limit: 5,
    filter: null,
    using: null,
    collectionName: params.collectionName,
  });
  const [visualizeChartHeight, setVisualizeChartHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const { height } = useWindowResize();
  const { enqueueSnackbar } = useSnackbar();
  const { client: qdrantClient } = useClient();

  const [code, setCode] = useState(defaultQuery);

  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
  }, [height, VisualizeChartWrapper]);

  const handlePointDisplay = useCallback((point) => {
    setActivePoint(point);
  }, []);

  useEffect(() => {
    if (newInitNode) {
      delete newInitNode.vector;
      setInitNode(newInitNode);

      const option = vectorName
        ? {
            limit: 5,
            using: vectorName,
          }
        : {
            limit: 5,
          };
      setCode(JSON.stringify(option, null, 2) + explanation);

      option.collectionName = params.collectionName;
      setOptions(option);
    }
  }, [newInitNode, vectorName]);

  const handleRunCode = async (data, collectionName) => {
    // scroll
    try {
      if (data.sample) {
        const sampleLinks = await getSamplePoints(qdrantClient, {
          collectionName: collectionName,
          ...data,
        });
        setSampleLinks(sampleLinks);
        setInitNode(null);
      } else {
        const firstPoint = await getFirstPoint(qdrantClient, { collectionName: collectionName, filter: data?.filter });
        setInitNode(firstPoint);
      }
      setOptions({
        collectionName: collectionName,
        ...data,
      });
    } catch (e) {
      enqueueSnackbar(e.message, { variant: 'error' });
    }
  };

  const queryRequestSchema = (vectorNames) => ({
    description: 'Filter request',
    type: 'object',
    properties: {
      limit: {
        description: 'Page size. Default: 10',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
      filter: {
        description: 'Look only for points which satisfies this conditions. If not provided - all points.',
        anyOf: [
          {
            $ref: '#/components/schemas/Filter',
          },
          {
            nullable: true,
          },
        ],
      },
      using: {
        description: 'Vector field name',
        type: 'string',
        enum: vectorNames,
      },
      sample: {
        description: 'Bootstrap graph with sample data from collection',
        type: 'integer',
        nullable: true,
      },
      tree: {
        description: 'Show spanning tree instead of full graph',
        type: 'boolean',
        nullable: true,
      },
    },
  });

  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid xs={12} item>
            <PanelGroup direction="horizontal" autoSaveId="persistence">
              <Panel defaultSize={50}>
                <Box width={'100%'}>
                  <Box>
                    <Paper
                      variant="heading"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 0,
                      }}
                    >
                      <Tooltip title={'Back to collection'}>
                        <IconButton
                          sx={{ mr: 3 }}
                          size="small"
                          onClick={() => navigate(`/collections/${params.collectionName}`)}
                        >
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h6">{params.collectionName}</Typography>
                    </Paper>
                  </Box>

                  <Box ref={VisualizeChartWrapper} height={visualizeChartHeight} width={'100%'}>
                    <GraphVisualisation
                      options={options}
                      initNode={initNode}
                      onDataDisplay={handlePointDisplay}
                      wrapperRef={VisualizeChartWrapper.current}
                      sampleLinks={sampleLinks}
                    />
                  </Box>
                </Box>
              </Panel>
              <PanelResizeHandle
                style={{
                  width: '10px',
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  &#8942;
                </Box>
              </PanelResizeHandle>
              <Panel>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={40}>
                    <CodeEditorWindow
                      code={code}
                      onChange={setCode}
                      onChangeResult={handleRunCode}
                      customRequestSchema={queryRequestSchema}
                    />
                  </Panel>
                  <PanelResizeHandle
                    style={{
                      height: '10px',
                      background: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      &#8943;
                    </Box>
                  </PanelResizeHandle>
                  <Panel
                    defaultSize={60}
                    style={{
                      overflowY: 'scroll',
                    }}
                  >
                    {activePoint && <PointPreview point={activePoint} />}
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Graph;
