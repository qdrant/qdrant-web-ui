import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Box, Tooltip, Typography, Grid, IconButton, Tabs, Tab, List, ListItemButton } from '@mui/material';
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
import { getSimilarPoints } from '../lib/graph-visualization-helpers';
import { useSnackbar } from 'notistack';

// Lazy: SelectionPanel pulls in @mui/x-data-grid (~90 KB gzipped), which is
// only needed once the user makes a selection
const SelectionPanel = React.lazy(() => import('../components/VisualizeChart/SelectionPanel'));

const SIMILAR_POINTS_LIMIT = 12;

const query = `

// Try me!

{
  "limit": 2000
}

// Specify request parameters to select data for visualization.
//
// Distances between points are computed by Qdrant server-side
// (Distance Matrix API), so raw vectors are not transferred to the browser.
//
// Available parameters:
//
// - 'limit': number of points to sample for visualization.
//            UMAP (default) handles tens of thousands of points;
//            TSNE and PCA get slow above a few thousand.
//
// - 'n_neighbors': number of nearest neighbors per point to request
//                  from the server. Default: 15.
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
// - 'algorithm': specify algorithm to use for visualization.
//                Available options: 'UMAP' (default), 'TSNE',
//                'PCA' (loads raw vectors into the browser).
//
// - 'perplexity': TSNE only, effective number of neighbors per point.
//                 The request automatically fetches 3x this many
//                 neighbors from the server. Default: derived
//                 from 'n_neighbors'.
//
// - 'highlight': emphasize points matching a filter, dim the rest:
//
//                "highlight": {
//                  "filter": { ... }
//                }
//
// Chart interactions:
//
// - click a point to see its payload and its nearest neighbors
// - shift+drag to select points: the selection is emphasized and
//   the Selection tab opens, where selected points can be inspected
//   and copied (ids, JSON or a ready-to-use filter);
//   close the selection tag to reset it
// - drag to pan, mouse wheel to zoom


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
  const [panelsHeight, setPanelsHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const panelsWrapper = useRef(null);
  const { height } = useWindowResize();
  const [activePoint, setActivePoint] = useState(null);
  const [similarPoints, setSimilarPoints] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const clearSelection = () => {
    setSelectedPoints(null);
    // Leave the Selection tab if it was active, it is about to disappear
    setTabValue((prev) => (prev === 2 ? 0 : prev));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
    // Bound the whole split-pane area to the viewport, so an overly long
    // Data Panel scrolls inside its own pane instead of the whole page
    if (panelsWrapper.current) {
      setPanelsHeight(height - panelsWrapper.current.getBoundingClientRect().top);
    }
  }, [height, VisualizeChartWrapper, panelsWrapper]);

  useEffect(() => {
    if (activePoint != null && tabValue !== 1) {
      setTabValue(1);
    }
  }, [activePoint]);

  const onEditorCodeRun = async (data, collectionName) => {
    setVisualizationParams(data);
    setActivePoint(null);
    setSimilarPoints(null);
    clearSelection();

    try {
      const result = await requestData(qdrantClient, collectionName, data);
      setResult(result);
    } catch (e) {
      enqueueSnackbar(`Request error: ${e.message}`, { variant: 'error' });
    }
  };

  // Click on a point: show it in the Data Panel and highlight its
  // nearest neighbors, served live by Qdrant
  const onPointSelect = async (point) => {
    if (!point) {
      setActivePoint(null);
      setSimilarPoints(null);
      return;
    }
    setActivePoint(point);
    setSimilarPoints(null);
    try {
      const neighbors = await getSimilarPoints(qdrantClient, {
        collectionName: params.collectionName,
        pointId: point.id,
        limit: SIMILAR_POINTS_LIMIT,
        filter: visualizationParams?.filter ?? undefined,
        using: visualizationParams?.using ?? undefined,
      });
      setSimilarPoints(neighbors);
    } catch (e) {
      enqueueSnackbar(`Failed to load similar points: ${e.message}`, { variant: 'error' });
    }
  };

  // Shift+drag: the selection becomes the working set - selected points
  // stay bright, the rest is dimmed, and the Selection tab opens with
  // the list of selected points
  const onBoxSelect = (points) => {
    if (!points.length) {
      clearSelection();
      return;
    }
    setSelectedPoints(points);
    setTabValue(2);
  };

  // Points to emphasize in the chart, by precedence: the active selection,
  // then the neighbors of the clicked point, then the 'highlight' filter
  let focusIds = null;
  if (selectedPoints?.length) {
    focusIds = selectedPoints.map((point) => point.id);
  } else if (similarPoints && activePoint) {
    focusIds = [activePoint.id, ...similarPoints.map((point) => point.id)];
  } else if (result?.highlightIds?.length) {
    focusIds = result.highlightIds;
  }

  const filterRequestSchema = (vectorNames) => ({
    description: 'Filter request',
    type: 'object',
    properties: {
      limit: {
        description: 'Number of points to sample for visualization. Default: 1000',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
      n_neighbors: {
        description: 'Number of nearest neighbors per point in the server-side distance matrix. Default: 15',
        type: 'integer',
        format: 'uint',
        minimum: 2,
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
        enum: ['UMAP', 'TSNE', 'PCA'],
        default: 'UMAP',
      },
      perplexity: {
        description:
          'TSNE only: effective number of neighbors per point. 3x this many neighbors are requested from the server',
        type: 'number',
        minimum: 2,
        nullable: true,
      },
      highlight: {
        description: 'Emphasize points matching a filter, dim the rest',
        type: 'object',
        properties: {
          filter: {
            $ref: '#/components/schemas/Filter',
          },
        },
        nullable: true,
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
            <Box ref={panelsWrapper} sx={{ height: panelsHeight || 'auto', overflow: 'hidden' }}>
              <PanelGroup direction="horizontal" style={{ height: '100%' }}>
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
                        onPointSelect={onPointSelect}
                        onBoxSelect={onBoxSelect}
                        focusIds={focusIds}
                        selectionCount={selectedPoints?.length ?? 0}
                        onSelectionClear={clearSelection}
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
                        <Tab label="Code" value={0} />
                        <Tab label="Data Panel" value={1} />
                        {selectedPoints?.length > 0 && <Tab label={`Selection (${selectedPoints.length})`} value={2} />}
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
                        {similarPoints && similarPoints.length > 0 && (
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Similar points
                            </Typography>
                            <List dense disablePadding>
                              {similarPoints.map((point) => (
                                <ListItemButton
                                  key={String(point.id)}
                                  onClick={() => onPointSelect(point)}
                                  sx={{ display: 'flex', justifyContent: 'space-between' }}
                                >
                                  <Typography variant="body2">Point {String(point.id)}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {typeof point.score === 'number' ? point.score.toFixed(4) : ''}
                                  </Typography>
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </TabPanel>
                    {selectedPoints?.length > 0 && (
                      <TabPanel value={tabValue} index={2} style={{ flex: 1, overflow: 'hidden' }}>
                        <React.Suspense fallback={null}>
                          <SelectionPanel points={selectedPoints} onPointClick={onPointSelect} />
                        </React.Suspense>
                      </TabPanel>
                    )}
                  </Box>
                </Panel>
              </PanelGroup>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;
