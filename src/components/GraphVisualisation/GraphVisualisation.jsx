import React, { memo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  deduplicatePoints,
  getSimilarPoints,
  initGraph,
} from "../../lib/graph-visualization-helpers";
import ForceGraph from "force-graph";
import { useClient } from "../../context/client-context";

const GraphVisualisation = ({ options, onDataDisplay, wrapperRef }) => {
  const graphRef = useRef(null);
  const { client: qdrantClient } = useClient();

 const handleNodeClick = async (node) => {
   node.clicked = true;
   const {nodes, links} = graphRef.current.graphData();
   const pointId = node.id;
   const similarPoints = await getSimilarPoints(qdrantClient, {
      collectionName: options.collectionName,
      pointId,
      limit: options.limit,
      filter: options.filter,
      using: options.using
    });


   graphRef.current.graphData({
     nodes: [...nodes, ...deduplicatePoints(nodes, similarPoints) ],
     links: [...links, ...similarPoints.map((point) => ({ source: pointId, target: point.id }))]
   });
 }

  useEffect(() => {
    if (!graphRef.current) {
      const elem = document.getElementById('graph');
      const NODE_R = 4;
      let hoverNode = null;
      // eslint-disable-next-line new-cap
      graphRef.current = ForceGraph()(elem)
      .nodeColor(
          node => node.clicked ? '#e94' : '#2cb')
      .onNodeHover((node) => {
        if (!node) return;
        elem.style.cursor = 'pointer';
        hoverNode = node;
        onDataDisplay(node);
      })
      .nodeCanvasObjectMode(node => node?.id === hoverNode?.id ? 'before' : undefined)
      .nodeCanvasObject((node, ctx) => {
        if (!node) return;
        // add ring for last hovered nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.id === hoverNode?.id ? '#817' : 'transparent';
        ctx.fill();
      })
    }
  }, []);

 useEffect(() => {
   graphRef.current.width(wrapperRef?.clientWidth).height(wrapperRef?.clientHeight);
 }, [wrapperRef]);

  useEffect( () => {
    const initNewGraph = async () => {
      const graphData = await initGraph(
        qdrantClient, options
      );
      if (graphRef.current && options) {
        graphRef.current.graphData(graphData)
        .linkDirectionalArrowLength(3)
        .onNodeClick(handleNodeClick);
      }
    };
    initNewGraph().catch(console.error);
  }, [options]);

  return <div id="graph"></div>;
};

GraphVisualisation.propTypes = {
  options: PropTypes.object.isRequired,
  onDataDisplay: PropTypes.func.isRequired,
  wrapperRef: PropTypes.object,
};

export default memo(GraphVisualisation);