import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { alpha, Paper, Box, Tooltip, Typography, Grid, IconButton, Tabs, Tab, useMediaQuery } from '@mui/material';
import { ArrowBack, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import GraphVisualisation from '../components/GraphVisualisation/GraphVisualisation';
import { useWindowResize } from '../hooks/windowHooks';
import PointPreview from '../components/Common/PointPreview';
import TabPanel from '../components/Common/TabPanel';
import CodeEditorWindow from '../components/FilterEditorWindow';
import { useClient } from '../context/client-context';
import { getFirstPoint, getSamplePoints } from '../lib/graph-visualization-helpers';
import { useSnackbar } from 'notistack';

// Stacked (phone) layout: the graph is on top, the tabs in a bottom sheet below it
const SHEET_DEFAULT_SIZE = 45; // % of the panel group
const SHEET_MIN_SIZE = 25;
// When collapsed, the sheet still shows its tab bar
const SHEET_TABS_HEIGHT = 48; // px
const SHEET_HANDLE_HEIGHT = 20; // px

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
  // collapsed sheet would become a squeezed side panel: reset the split
  useLayoutEffect(() => {
    if (isFirstLayout.current) {
      isFirstLayout.current = false;
      return;
    }
    panelGroupRef.current?.setLayout(isVertical ? [100 - SHEET_DEFAULT_SIZE, SHEET_DEFAULT_SIZE] : [50, 50]);
    setSheetCollapsed(false);
  }, [isVertical]);
  const { enqueueSnackbar } = useSnackbar();
  const { client: qdrantClient } = useClient();

  const [code, setCode] = useState(defaultQuery);

  const [activePoint, setActivePoint] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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

  // Collapsed sheet size (in % of the panel group) that leaves its tab bar visible
  const sheetCollapsedSize = panelsHeight
    ? Math.min(SHEET_MIN_SIZE - 1, (SHEET_TABS_HEIGHT / Math.max(1, panelsHeight - SHEET_HANDLE_HEIGHT)) * 100)
    : 10;

  // Phone layout: the graph is laid out for the chart height with the sheet
  // collapsed, so opening the sheet covers the graph instead of squeezing it
  const minPictureHeight =
    isVertical && panelsHeight
      ? Math.round((panelsHeight - SHEET_HANDLE_HEIGHT) * (1 - sheetCollapsedSize / 100) - chartHeaderHeight)
      : undefined;

  const handlePointDisplay = useCallback((point) => {
    setActivePoint(point);
  }, []);

  // Done on click rather than only in an effect on activePoint: tapping the
  // node that is already active must bring a collapsed sheet back up, too
  const handleNodeSelect = () => {
    setTabValue(1);
    revealSheet();
  };

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
    // On a phone the editor covers much of the graph, get it out of the way
    if (isVertical) {
      sheetRef.current?.collapse();
    }
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
      revealSheet();
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

  useEffect(() => {
    if (activePoint != null && tabValue !== 1) {
      setTabValue(1);
    }
  }, [activePoint]);

  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid size={12}>
            <Box ref={panelsWrapper} sx={{ height: panelsHeight || 'auto', overflow: 'hidden' }}>
              <PanelGroup
                ref={panelGroupRef}
                direction={isVertical ? 'vertical' : 'horizontal'}
                // A phone layout saved under the same key would be restored as a desktop one
                autoSaveId={isVertical ? undefined : 'persistence'}
                style={{ height: '100%' }}
              >
                <Panel
                  id="graph-chart"
                  order={1}
                  defaultSize={isVertical ? 100 - SHEET_DEFAULT_SIZE : 50}
                  minSize={isVertical ? 20 : 10}
                >
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper
                      ref={chartHeaderRef}
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
                      <GraphVisualisation
                        options={options}
                        initNode={initNode}
                        onDataDisplay={handlePointDisplay}
                        onNodeSelect={handleNodeSelect}
                        sampleLinks={sampleLinks}
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
                )}
                <Panel
                  id="graph-side"
                  order={2}
                  ref={sheetRef}
                  defaultSize={isVertical ? SHEET_DEFAULT_SIZE : 50}
                  minSize={isVertical ? SHEET_MIN_SIZE : 10}
                  collapsible={isVertical}
                  collapsedSize={isVertical ? sheetCollapsedSize : 0}
                  onCollapse={() => setSheetCollapsed(true)}
                  onExpand={() => setSheetCollapsed(false)}
                  // Not clipped, so the sheet toggle can reach over the grab bar
                  // (the content box clips instead). minHeight: 0 keeps the
                  // content from stretching the panel, as overflow: hidden did
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
                        aria-label="graph visualization tabs"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Tab label="Code" />
                        <Tab label={isVertical ? 'Point' : 'Data Panel'} />
                      </Tabs>
                    </Box>
                    <TabPanel value={tabValue} index={0} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <CodeEditorWindow
                        code={code}
                        onChange={setCode}
                        onChangeResult={handleRunCode}
                        customRequestSchema={queryRequestSchema}
                      />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', overflowY: 'auto' }}>
                        <PointPreview point={activePoint} />
                      </Box>
                    </TabPanel>
                  </Box>
                  {isVertical && (
                    // Centered on the grab bar and tab bar together. Stacked above
                    // the grab bar, so pressing it doesn't start a resize
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

export default Graph;
