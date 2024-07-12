import React, { memo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  deduplicatePoints,
  getSimilarPoints,
  initGraph,
} from "../../lib/graph-visualization-helpers";
import ForceGraph from "force-graph";
import { useClient } from "../../context/client-context";

// eslint-disable-next-line no-unused-vars
const GraphVisualisation = ({ options, onNodeClick }) => {
  const graphRef = useRef(null);
  const { client: qdrantClient } = useClient();

 const handleNodeClick = async (node) => {
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
      // eslint-disable-next-line new-cap
      graphRef.current = ForceGraph()(elem)
      .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null);
    }
  }, []);

  useEffect( () => {
    const initNewGraph = async () => {
      const graphData = await initGraph(
        qdrantClient, options
      );
      console.log('graphData', graphData);
      if (graphRef.current && options) {
        graphRef.current.graphData(graphData).onNodeClick(handleNodeClick);
      }
    };
    initNewGraph().catch(console.error);
  }, [options]);

  return <div id="graph"></div>;
};

GraphVisualisation.propTypes = {
  options: PropTypes.object.isRequired,
  onNodeClick: PropTypes.func.isRequired
};

export default memo(GraphVisualisation);