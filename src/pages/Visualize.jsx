import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Paper,
  Box,
  Tooltip,
  Typography,
  Grid,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItemButton,
  alpha,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, ExpandLess, ExpandMore, Visibility, VisibilityOff } from '@mui/icons-material';
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
import { getErrorMessage } from '../lib/get-error-message';
import { useSnackbar } from 'notistack';

// Lazy: SelectionPanel pulls in @mui/x-data-grid (~90 KB gzipped), which is
// only needed once the user makes a selection
const SelectionPanel = React.lazy(() => import('../components/VisualizeChart/SelectionPanel'));

const SIMILAR_POINTS_LIMIT = 12;

// Stacked (phone) layout: the chart is on top and the tabs live in a
// bottom sheet below it, like a map with a details sheet
const SHEET_DEFAULT_SIZE = 45; // % of the page height
const SHEET_MIN_SIZE = 25;
// When collapsed, the sheet still shows its tab bar
const SHEET_TABS_HEIGHT = 48; // px
const SHEET_HANDLE_HEIGHT = 20; // px

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
// - shift+drag (or the "Select area" button) to select points: the selection is emphasized and
//   the Selection tab opens, where selected points can be inspected
//   and copied (ids, JSON or a ready-to-use filter);
//   close the selection tag to reset it
// - drag to pan, mouse wheel or pinch to zoom


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
  const [panelsHeight, setPanelsHeight] = useState(0);
  const panelsWrapper = useRef(null);
  const chartHeaderRef = useRef(null);
  const [chartHeaderHeight, setChartHeaderHeight] = useState(0);
  const { width, height } = useWindowResize();
  // Below md two side-by-side panes get too narrow, so they are stacked
  const isVertical = useMediaQuery(theme.breakpoints.down('md'));
  const panelGroupRef = useRef(null);
  const sheetRef = useRef(null);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const isFirstLayout = useRef(true);

  // The panel group keeps its sizes (in %) when its direction flips, so a
  // collapsed phone sheet would turn into a squeezed desktop side panel.
  // Start each orientation from its own default split instead
  useLayoutEffect(() => {
    if (isFirstLayout.current) {
      isFirstLayout.current = false;
      return;
    }
    panelGroupRef.current?.setLayout(isVertical ? [100 - SHEET_DEFAULT_SIZE, SHEET_DEFAULT_SIZE] : [50, 50]);
    setSheetCollapsed(false);
  }, [isVertical]);
  const [activePoint, setActivePoint] = useState(null);
  const [similarPoints, setSimilarPoints] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  // True while the distance-matrix request is in flight, before any layout
  // work starts - the first request can be slow, so surface it right away
  const [fetching, setFetching] = useState(false);

  // Ids currently sampled into the visualization. Similar points are queried
  // against the whole collection (a sample-restricted filter would be huge),
  // so some neighbors are not part of what is drawn - mark them as such
  const sampledIds = useMemo(() => new Set((result.points ?? []).map((point) => String(point.id))), [result]);

  const clearSelection = () => {
    setSelectedPoints(null);
    // Leave the Selection tab if it was active, it is about to disappear
    setTabValue((prev) => (prev === 2 ? 0 : prev));
  };

  // Bring the bottom sheet up when there is something new to look at in it
  const revealSheet = () => {
    if (isVertical && sheetRef.current?.isCollapsed()) {
      sheetRef.current.resize(SHEET_DEFAULT_SIZE);
    }
  };

  const toggleSheet = () => {
    if (sheetRef.current?.isCollapsed()) {
      sheetRef.current.resize(SHEET_DEFAULT_SIZE);
    } else {
      sheetRef.current?.collapse();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    revealSheet();
  };

  useEffect(() => {
    // Bound the whole split-pane area to the viewport, so an overly long
    // Data Panel scrolls inside its own pane instead of the whole page
    if (panelsWrapper.current) {
      setPanelsHeight(height - panelsWrapper.current.getBoundingClientRect().top);
    }
    setChartHeaderHeight(chartHeaderRef.current?.offsetHeight ?? 0);
  }, [width, height, isVertical]);

  // Collapsed sheet keeps its tab bar visible, in % of the panel group
  const sheetCollapsedSize = panelsHeight
    ? Math.min(SHEET_MIN_SIZE - 1, (SHEET_TABS_HEIGHT / Math.max(1, panelsHeight - SHEET_HANDLE_HEIGHT)) * 100)
    : 10;

  // Phone layout: the chart picture is laid out for the chart's height with
  // the sheet collapsed, and never shrinks below it - an opened sheet slides
  // over the bottom of the picture instead of squeezing it, like over a map
  const minPictureHeight =
    isVertical && panelsHeight
      ? Math.round((panelsHeight - SHEET_HANDLE_HEIGHT) * (1 - sheetCollapsedSize / 100) - chartHeaderHeight)
      : undefined;

  const onEditorCodeRun = async (data, collectionName) => {
    setVisualizationParams(data);
    setActivePoint(null);
    setSimilarPoints(null);
    clearSelection();
    setFetching(true);
    // On a phone the editor covers much of the chart, get it out of the way
    if (isVertical) {
      sheetRef.current?.collapse();
    }

    try {
      const result = await requestData(qdrantClient, collectionName, data);
      setResult(result);
    } catch (e) {
      enqueueSnackbar(`Request error: ${getErrorMessage(e)}`, { variant: 'error' });
      revealSheet();
    } finally {
      setFetching(false);
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
    // Done here rather than in an effect on activePoint: tapping the point
    // that is already active must bring a collapsed sheet back up, too
    setTabValue(1);
    revealSheet();
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
      enqueueSnackbar(`Failed to load similar points: ${getErrorMessage(e)}`, { variant: 'error' });
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
    revealSheet();
  };

  // Points to emphasize in the chart, by precedence: the active selection,
  // then the neighbors of the clicked point, then the 'highlight' filter
  // Memoized: the page re-renders on every window resize, and a new array
  // would make the chart rebuild and re-upload the colors of all points
  const focusIds = useMemo(() => {
    if (selectedPoints?.length) {
      return selectedPoints.map((point) => point.id);
    }
    if (similarPoints && activePoint) {
      return [activePoint.id, ...similarPoints.map((point) => point.id)];
    }
    if (result?.highlightIds?.length) {
      return result.highlightIds;
    }
    return null;
  }, [selectedPoints, similarPoints, activePoint, result]);

  // The clicked point gets a distinct marker, but not while a box selection
  // (which has no single "current" point) is the active emphasis
  const selectedId = !selectedPoints?.length && activePoint ? activePoint.id : null;

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
              <PanelGroup
                ref={panelGroupRef}
                direction={isVertical ? 'vertical' : 'horizontal'}
                style={{ height: '100%' }}
              >
                <Panel id="visualize-chart" order={1} minSize={isVertical ? 20 : 10}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper
                      ref={chartHeaderRef}
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
                          sx={{ mr: { xs: 1, sm: 3 } }}
                          size="small"
                          onClick={() => navigate(`/collections/${encodeURIComponent(params.collectionName)}`)}
                        >
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h6" noWrap>
                        {params.collectionName}
                      </Typography>
                    </Paper>
                    <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
                      <VisualizeChart
                        requestResult={result}
                        visualizationParams={visualizationParams}
                        fetching={fetching}
                        onPointSelect={onPointSelect}
                        onBoxSelect={onBoxSelect}
                        focusIds={focusIds}
                        selectedId={selectedId}
                        selectionCount={selectedPoints?.length ?? 0}
                        onSelectionClear={clearSelection}
                        layoutKey={isVertical ? 'vertical' : 'horizontal'}
                        minPictureHeight={minPictureHeight}
                      />
                    </Box>
                  </Box>
                </Panel>
                {isVertical ? (
                  // Grab bar of the bottom sheet, tall enough to drag with a finger
                  <PanelResizeHandle
                    style={{
                      height: SHEET_HANDLE_HEIGHT,
                      background: theme.palette.background.paper,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      touchAction: 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Box sx={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'text.disabled' }} />
                    </Box>
                  </PanelResizeHandle>
                ) : (
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
                )}
                <Panel
                  id="visualize-side"
                  order={2}
                  ref={sheetRef}
                  defaultSize={isVertical ? SHEET_DEFAULT_SIZE : undefined}
                  minSize={isVertical ? SHEET_MIN_SIZE : 10}
                  collapsible={isVertical}
                  collapsedSize={isVertical ? sheetCollapsedSize : 0}
                  onCollapse={() => setSheetCollapsed(true)}
                  onExpand={() => setSheetCollapsed(false)}
                  // The sheet toggle reaches up over the grab bar, so the panel
                  // must not clip it - the content below clips itself instead.
                  // minHeight: 0 keeps the content from stretching the panel,
                  // which overflow: hidden otherwise takes care of
                  style={isVertical ? { overflow: 'visible', position: 'relative', minHeight: 0 } : undefined}
                >
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        // Room for the sheet toggle
                        pr: isVertical ? 6 : 0,
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: theme.palette.background.paper,
                      }}
                    >
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons={false}
                        aria-label="visualization tabs"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Tab label="Code" value={0} />
                        <Tab label={isVertical ? 'Point' : 'Data Panel'} value={1} />
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
                          <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.12)}` }}>
                            {/* Match the section-header treatment used in PointPreview */}
                            <Box
                              component="header"
                              sx={{
                                backgroundColor: alpha(theme.palette.action.hover, 0.08),
                                px: 2,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                height: 48,
                              }}
                            >
                              <Typography variant="h6">Similar points</Typography>
                            </Box>
                            <List dense disablePadding sx={{ py: 1 }}>
                              {similarPoints.map((point) => {
                                const inSample = sampledIds.has(String(point.id));
                                return (
                                  <ListItemButton
                                    key={String(point.id)}
                                    onClick={() => onPointSelect(point)}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      gap: 1,
                                      px: 2,
                                      opacity: inSample ? 1 : 0.55,
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                      <Tooltip
                                        title={
                                          inSample
                                            ? 'Shown in the visualization'
                                            : 'Not among the sampled points, so it is not shown in the chart'
                                        }
                                      >
                                        {inSample ? (
                                          <Visibility fontSize="small" color="action" />
                                        ) : (
                                          <VisibilityOff fontSize="small" color="disabled" />
                                        )}
                                      </Tooltip>
                                      <Typography variant="body2" noWrap>
                                        Point {String(point.id)}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {typeof point.score === 'number' ? point.score.toFixed(4) : ''}
                                    </Typography>
                                  </ListItemButton>
                                );
                              })}
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
                  {isVertical && (
                    // Centered on the grab bar + tab bar together, as one sheet header.
                    // Being stacked above the grab bar, pressing it doesn't start a resize
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -SHEET_HANDLE_HEIGHT,
                        right: 0,
                        height: SHEET_HANDLE_HEIGHT + SHEET_TABS_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                    >
                      <Tooltip title={sheetCollapsed ? 'Expand panel' : 'Collapse panel'}>
                        <IconButton
                          onClick={toggleSheet}
                          aria-label={sheetCollapsed ? 'Expand panel' : 'Collapse panel'}
                          sx={{ mx: 0.5 }}
                        >
                          {sheetCollapsed ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
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
