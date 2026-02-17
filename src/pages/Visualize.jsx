import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Box, Tooltip, Typography, Grid, IconButton, Tabs, Tab } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FilterEditorWindow from '../components/FilterEditorWindow';
import VisualizeChart from '../components/VisualizeChart';
import { useWindowResize } from '../hooks/windowHooks';
import PointPreview from '../components/Common/PointPreview';
import TabPanel from '../components/Common/TabPanel';
import { useClient } from '../context/client-context';
import { requestData } from '../components/VisualizeChart/requestData';
import { useSnackbar } from 'notistack';

const query = `

// Try me!

{
  "limit": 500
}

// Specify request parameters to select data for visualization.
//
// Available parameters:
//
// - 'limit': maximum number of vectors to visualize.
//            *Warning*: large values may cause browser to freeze.
//
// - 'filter': filter expression to select vectors for visualization.
//             See https://qdrant.tech/documentation/concepts/filtering/
//
// - 'color_by': specify score or payload field to use for coloring points.
//               How to use:
//
//                "color_by": {
//                  "payload": "field_name"
//                }
//
// - 'using': specify which vector to use for visualization
//                  if there are multiple.
//
// - 'algorithm': specify algorithm to use for visualization. Available options: 'TSNE', 'UMAP', 'PCA'.


`;
const defaultResult = {};

function Visualize() {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [code, setCode] = useState(query);

  // Contains the raw output of the request of QdrantClient
  const [result, setResult] = useState(defaultResult);
  const [visualizationParams, setVisualizationParams] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  // const [errorMessage, setErrorMessage] = useState(null); // todo: use or remove
  const navigate = useNavigate();
  const params = useParams();
  const [visualizeChartHeight, setVisualizeChartHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const { height } = useWindowResize();
  const [activePoint, setActivePoint] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
  }, [height, VisualizeChartWrapper]);

  useEffect(() => {
    if (activePoint != null && tabValue !== 1) {
      setTabValue(1);
    }
  }, [activePoint]);

  const onEditorCodeRun = async (data, collectionName) => {
    setVisualizationParams(data);

    try {
      const result = await requestData(qdrantClient, collectionName, data);
      setResult(result);
    } catch (e) {
      enqueueSnackbar(`Request error: ${e.message}`, { variant: 'error' });
    }
  };

  const filterRequestSchema = (vectorNames) => ({
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
        description: 'Specify which vector to use for visualization',
        type: 'string',
        enum: vectorNames,
      },
      color_by: {
        description: 'Color points by this field',
        anyOf: [
          {
            type: 'string', // Name of the field to use for coloring
          },
          {
            description: 'field name',
            type: 'object',
            properties: {
              payload: {
                description: 'Name of the field to use for coloring',
                type: 'string',
              },
            },
          },
          {
            description: 'query',
            type: 'object',
            properties: {
              query: {
                $ref: '#/components/schemas/QueryInterface',
              },
            },
          },
          {
            nullable: true,
          },
        ],
      },
      algorithm: {
        description: 'Algorithm to use for visualization',
        type: 'string',
        enum: ['TSNE', 'UMAP', 'PCA'],
        default: 'TSNE',
      },
    },
  });

  return (
    <>
      <Box component="main">
        {/* {errorMessage !== null && <ErrorNotifier {...{message: errorMessage}} />} */}
        <Grid container>
          {/*  {errorMessage && (*/}
          {/*    <Grid xs={12} item textAlign={'center'}>*/}
          {/*      <Typography>⚠ Error: {errorMessage}</Typography>*/}
          {/*    </Grid>*/}
          {/*  )}*/}
          <Grid size={12}>
            <PanelGroup direction="horizontal">
              <Panel style={{ display: 'flex' }}>
                <Box width={'100%'}>
                  <Box>
                    <Paper
                      variant="heading"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 0,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Tooltip title={'Back to collection'}>
                        <IconButton
                          sx={{ mr: 3 }}
                          size="small"
                          onClick={() => navigate(`/collections/${encodeURIComponent(params.collectionName)}`)}
                        >
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h6">{params.collectionName}</Typography>
                    </Paper>
                  </Box>
                  <Box ref={VisualizeChartWrapper} height={visualizeChartHeight} width={'100%'}>
                    <VisualizeChart
                      requestResult={result}
                      visualizationParams={visualizationParams}
                      activePoint={activePoint}
                      setActivePoint={setActivePoint}
                    />
                  </Box>
                </Box>
              </Panel>
              <PanelResizeHandle
                style={{
                  width: '10px',
                  background: theme.palette.background.paperElevation2,
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
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="visualization tabs">
                      <Tab label="Code" />
                      <Tab label="Data Panel" />
                    </Tabs>
                  </Box>
                  <TabPanel value={tabValue} index={0} style={{ flex: 1, overflow: 'hidden' }}>
                    <FilterEditorWindow
                      code={code}
                      onChange={setCode}
                      onChangeResult={onEditorCodeRun}
                      customRequestSchema={filterRequestSchema}
                    />
                  </TabPanel>
                  <TabPanel value={tabValue} index={1} style={{ flex: 1, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', overflowY: 'scroll' }}>
                      <PointPreview point={activePoint} />
                    </Box>
                  </TabPanel>
                </Box>
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;
