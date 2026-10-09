import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Paper, Tooltip } from '@mui/material';
import { CenterFocusStrong } from '@mui/icons-material';
import { deduplicatePoints, getSimilarPoints, initGraph } from '../../lib/graph-visualization-helpers';
import ForceGraph from 'force-graph';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

const DEFAULT_GRAPH_COLORS = {
  nodeClicked: '#e94',
  nodeDefault: '#2cb',
  nodeHighlightRing: '#817',
  linkDefault: '#a6a6a6',
};

const NODE_R = 4;
// Fingers are imprecise: on touch screens a node can be tapped within this
// radius (CSS px) around it
const TAP_PICK_RADIUS_PX = 16;
// Default minimal size (CSS px) of the graph canvas, see minPictureHeight.
// A smaller chart shows only part of the canvas instead of squeezing the graph
const MIN_GRAPH_WIDTH = 300;
const MIN_GRAPH_HEIGHT = 240;
// Distance (CSS px) from the chart edges the highlighted node is kept at
const SELECTED_EDGE_MARGIN_PX = 32;
const FIT_PADDING_PX = 20;
const FIT_TRANSITION_MS = 400;

// The hit areas are repainted with a delay, so they can't follow the type of
// each pointer: the primary one decides
const isCoarsePointer = () => window.matchMedia?.('(pointer: coarse)').matches ?? false;

const GraphVisualisation = ({ initNode, options, onDataDisplay, onNodeSelect, sampleLinks, minPictureHeight }) => {
  const theme = useTheme();
  const graphColors = theme.palette.graphVisualization ?? DEFAULT_GRAPH_COLORS;
  const graphColorsRef = useRef(graphColors);
  graphColorsRef.current = graphColors;
  const callbacksRef = useRef({ onDataDisplay, onNodeSelect });
  callbacksRef.current = { onDataDisplay, onNodeSelect };
  const graphRef = useRef(null);
  // The visible part of the chart, the graph canvas may overflow it
  const viewportRef = useRef(null);
  const graphElemRef = useRef(null);
  // Node shown in the data panel, marked with a ring
  const highlightedNodeRef = useRef(null);
  // Hover only makes sense for a mouse, a touch has no "over" state
  const lastPointerTypeRef = useRef(isCoarsePointer() ? 'touch' : 'mouse');
  // CSS size of the viewport the view was last adjusted for
  const viewSizeRef = useRef(null);
  // CSS px the view was panned by to keep the highlighted node in sight,
  // undone when there is room again (see keepNodeInView)
  const autoPanRef = useRef([0, 0]);
  const isAutoPanningRef = useRef(false);
  const { client: qdrantClient } = useClient();
  const { enqueueSnackbar } = useSnackbar();

  const handleNodeClick = async (node) => {
    node.clicked = true;
    highlightedNodeRef.current = node;
    callbacksRef.current.onDataDisplay(node);
    callbacksRef.current.onNodeSelect?.(node);
    const { nodes, links } = graphRef.current.graphData();
    const pointId = node.id;

    let similarPoints = [];
    try {
      similarPoints = await getSimilarPoints(qdrantClient, {
        collectionName: options.collectionName,
        pointId,
        limit: options.limit,
        filter: options.filter,
        using: options.using,
      });
    } catch (e) {
      enqueueSnackbar(e.message, { variant: 'error' });
      return;
    }

    graphRef.current.graphData({
      nodes: [...nodes, ...deduplicatePoints(nodes, similarPoints)],
      links: [...links, ...similarPoints.map((point) => ({ source: pointId, target: point.id }))],
    });
  };

  const isNodeInView = (size) => {
    const node = highlightedNodeRef.current;
    if (!graphRef.current || !node || node.x === undefined) return false;
    const { x, y } = graphRef.current.graph2ScreenCoords(node.x, node.y);
    return x >= 0 && x <= size[0] && y >= 0 && y <= size[1];
  };

  // Pan the least needed to bring the highlighted node inside the viewport,
  // with a margin. Aims for where it was before the automatic panning
  // (autoPan), undoing it as far as the viewport allows
  const keepNodeInView = (size) => {
    const graph = graphRef.current;
    const node = highlightedNodeRef.current;
    if (!graph || !node || node.x === undefined) return;
    const { x, y } = graph.graph2ScreenCoords(node.x, node.y);
    const position = [x, y];
    const shift = [0, 0];
    for (const axis of [0, 1]) {
      const margin = Math.min(SELECTED_EDGE_MARGIN_PX, size[axis] / 2);
      const wanted = position[axis] - autoPanRef.current[axis];
      const target = Math.min(Math.max(wanted, margin), size[axis] - margin);
      shift[axis] = target - position[axis];
    }
    if (shift[0] === 0 && shift[1] === 0) return;
    const k = graph.zoom();
    const center = graph.centerAt();
    // Not a user adjustment, so it doesn't reset autoPan (see onZoom)
    isAutoPanningRef.current = true;
    graph.centerAt(center.x - shift[0] / k, center.y - shift[1] / k);
    isAutoPanningRef.current = false;
    autoPanRef.current = [autoPanRef.current[0] + shift[0], autoPanRef.current[1] + shift[1]];
  };

  // Size the canvas to its element, and keep the highlighted node in sight
  // when the viewport changes, e.g. when a panel opens over the chart
  const adjustToSize = () => {
    const graph = graphRef.current;
    const viewport = viewportRef.current;
    const elem = graphElemRef.current;
    if (!graph || !viewport || !elem) return;
    const size = [viewport.clientWidth, viewport.clientHeight];
    if (size[0] < 1 || size[1] < 1) return;
    const prev = viewSizeRef.current;
    // A node that was already out of sight stays so
    const wasNodeInView = prev && isNodeInView(prev);
    if (graph.width() !== elem.clientWidth || graph.height() !== elem.clientHeight) {
      graph.width(elem.clientWidth).height(elem.clientHeight);
    }
    viewSizeRef.current = size;
    if (wasNodeInView) {
      keepNodeInView(size);
    }
  };

  // Fit all nodes into the visible part of the chart
  const fitView = () => {
    const graph = graphRef.current;
    const viewport = viewportRef.current;
    const bbox = graph?.getGraphBbox();
    if (!bbox || !viewport) return;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const k = Math.max(
      1e-12,
      Math.min(
        (width - FIT_PADDING_PX * 2) / (bbox.x[1] - bbox.x[0] || 1),
        (height - FIT_PADDING_PX * 2) / (bbox.y[1] - bbox.y[0] || 1)
      )
    );
    // centerAt aims for the canvas center, which is below the viewport
    // center when the canvas overflows it
    const offsetX = (graph.width() - width) / 2 / k;
    const offsetY = (graph.height() - height) / 2 / k;
    graph.centerAt((bbox.x[0] + bbox.x[1]) / 2 + offsetX, (bbox.y[0] + bbox.y[1]) / 2 + offsetY, FIT_TRANSITION_MS);
    graph.zoom(k, FIT_TRANSITION_MS);
  };

  useEffect(() => {
    const elem = graphElemRef.current;
    highlightedNodeRef.current = null;
    autoPanRef.current = [0, 0];
    viewSizeRef.current = null;
    const trackPointerType = (e) => {
      lastPointerTypeRef.current = e.pointerType;
    };
    elem.addEventListener('pointerdown', trackPointerType, { capture: true });
    elem.addEventListener('pointermove', trackPointerType, { capture: true });
    const coarsePointer = isCoarsePointer();
    // eslint-disable-next-line new-cap
    graphRef.current = ForceGraph()(elem)
      .nodeColor((node) => {
        const gc = graphColorsRef.current;
        return node.clicked ? gc.nodeClicked : gc.nodeDefault;
      })
      .onNodeHover((node) => {
        if (!node) {
          elem.style.cursor = 'default';
          return;
        }
        elem.style.cursor = 'pointer';
        // On touch the pointer position stays where the finger was lifted, so
        // nodes moving under it would keep replacing the shown one. Taps
        // display the node through the click instead
        if (lastPointerTypeRef.current !== 'mouse') return;
        node.aa = 1;
        highlightedNodeRef.current = node;
        callbacksRef.current.onDataDisplay(node);
      })
      .onZoom(() => {
        // A user pan or zoom: the automatic panning is not to be undone anymore
        if (!isAutoPanningRef.current) {
          autoPanRef.current = [0, 0];
        }
      })
      .autoPauseRedraw(false)
      .nodeCanvasObjectMode((node) => {
        return node?.id === highlightedNodeRef.current?.id ? 'before' : undefined;
      })
      .nodeCanvasObject((node, ctx) => {
        if (!node) return;
        const gc = graphColorsRef.current;
        // add ring for last hovered nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.id === highlightedNodeRef.current?.id ? gc.nodeHighlightRing : 'transparent';
        ctx.fill();
      })
      .nodePointerAreaPaint((node, color, ctx, globalScale) => {
        // Same as the default area (1px wider for anti-aliasing), but large
        // enough to hit with a finger on touch screens
        const radius = coarsePointer ? Math.max(NODE_R, TAP_PICK_RADIUS_PX / globalScale) : NODE_R + 1 / globalScale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
      })
      .linkLabel('score')
      .linkColor(() => graphColorsRef.current.linkDefault);

    graphRef.current.d3Force('charge').strength(-10);
    adjustToSize();

    return () => {
      elem.removeEventListener('pointerdown', trackPointerType, { capture: true });
      elem.removeEventListener('pointermove', trackPointerType, { capture: true });
      // Stops the animation loop of the replaced graph
      graphRef.current?._destructor();
    };
  }, [initNode, options]);

  useEffect(() => {
    const viewport = viewportRef.current;
    // Not debounced: the canvas would be stretched until the resize lands
    const resizeObserver = new ResizeObserver(() => adjustToSize());
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, []);

  // The canvas may change its size without the viewport changing
  useEffect(() => {
    adjustToSize();
  }, [minPictureHeight]);

  useEffect(() => {
    const initNewGraph = async () => {
      const graphData = await initGraph(qdrantClient, {
        ...options,
        initNode,
        sampleLinks,
      });
      if (graphRef.current && options) {
        const initialActiveNode = graphData.nodes[0];
        onDataDisplay(initialActiveNode);
        highlightedNodeRef.current = initialActiveNode;
        graphRef.current.graphData(graphData).linkDirectionalArrowLength(3).onNodeClick(handleNodeClick);
      }
    };
    initNewGraph().catch((e) => {
      console.error(e);
      if (e.getActualType) {
        enqueueSnackbar(JSON.stringify(e.getActualType()), { variant: 'error' });
      } else {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    });
  }, [initNode, options, sampleLinks]);

  return (
    <Box ref={viewportRef} sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={graphElemRef}
        style={{
          width: '100%',
          height: '100%',
          minWidth: MIN_GRAPH_WIDTH,
          minHeight: minPictureHeight ?? MIN_GRAPH_HEIGHT,
        }}
      />
      <Paper elevation={2} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, borderRadius: 2 }}>
        <Tooltip title="Fit all points" placement="left">
          <IconButton aria-label="Fit all points" onClick={fitView}>
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

GraphVisualisation.propTypes = {
  initNode: PropTypes.object,
  options: PropTypes.object.isRequired,
  onDataDisplay: PropTypes.func.isRequired,
  onNodeSelect: PropTypes.func, // callback: a node was clicked or tapped
  sampleLinks: PropTypes.array,
  minPictureHeight: PropTypes.number, // the canvas is at least this high (CSS px), default if not set
};

export default GraphVisualisation;
