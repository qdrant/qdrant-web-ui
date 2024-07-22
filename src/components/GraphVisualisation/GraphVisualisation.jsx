import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { deduplicatePoints, getSimilarPoints, initGraph } from '../../lib/graph-visualization-helpers';
import ForceGraph from 'force-graph';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';

const GraphVisualisation = ({ initNode, options, onDataDisplay, wrapperRef }) => {
  const graphRef = useRef(null);
  const { client: qdrantClient } = useClient();
  const { enqueueSnackbar } = useSnackbar();
  const NODE_R = 4;
  let highlightedNode = null;

  const handleNodeClick = async (node) => {
    node.clicked = true;
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

  useEffect(() => {
    const elem = document.getElementById('graph');
    // eslint-disable-next-line new-cap
    graphRef.current = ForceGraph()(elem)
      .nodeColor((node) => (node.clicked ? '#e94' : '#2cb'))
      .onNodeHover((node) => {
        if (!node) {
          elem.style.cursor = 'default';
          return;
        }
        node.aa = 1;
        elem.style.cursor = 'pointer';
        highlightedNode = node;
        onDataDisplay(node);
      })
      .autoPauseRedraw(false)
      .nodeCanvasObjectMode((node) => (node?.id === highlightedNode?.id ? 'before' : undefined))
      .nodeCanvasObject((node, ctx) => {
        if (!node) return;
        // add ring for last hovered nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.id === highlightedNode?.id ? '#817' : 'transparent';
        ctx.fill();
      })
      .linkColor(() => '#a6a6a6');
  }, [initNode, options]);

  useEffect(() => {
    graphRef.current.width(wrapperRef?.clientWidth).height(wrapperRef?.clientHeight);
  }, [wrapperRef, initNode, options]);

  useEffect(() => {
    const initNewGraph = async () => {

      const graphData = await initGraph(qdrantClient, {
        ...options,
        initNode,
      });
      if (graphRef.current && options) {
        const initialActiveNode = graphData.nodes[0];
        onDataDisplay(initialActiveNode);
        highlightedNode = initialActiveNode;
        graphRef.current.graphData(graphData).linkDirectionalArrowLength(3).onNodeClick(handleNodeClick);
      }
    };
    initNewGraph().catch((e) => {
      enqueueSnackbar(JSON.stringify(e.getActualType()), { variant: 'error' });
    });
  }, [initNode, options]);


  return <div id="graph"></div>;
};

GraphVisualisation.propTypes = {
  initNode: PropTypes.object,
  options: PropTypes.object.isRequired,
  onDataDisplay: PropTypes.func.isRequired,
  wrapperRef: PropTypes.object,
};

export default GraphVisualisation;
