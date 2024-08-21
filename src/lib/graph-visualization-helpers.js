import { axiosInstance } from '../common/axios';

export const initGraph = async (qdrantClient, { collectionName, initNode, limit, filter, using, sampleLinks }) => {
  let nodes = [];
  let links = [];

  if (sampleLinks) {
    const uniquePoints = new Set();

    for (const link of sampleLinks) {
      links.push({ source: link.a, target: link.b });
      uniquePoints.add(link.a);
      uniquePoints.add(link.b);
    }

    nodes = await getPointsWithPayload(qdrantClient, { collectionName, pointIds: Array.from(uniquePoints) });
  } else if (initNode) {
    initNode.clicked = true;
    nodes = await getSimilarPoints(qdrantClient, { collectionName, pointId: initNode.id, limit, filter, using });
    links = nodes.map((point) => ({ source: initNode.id, target: point.id }));
    nodes = [initNode, ...nodes];
  } else {
    return {
      nodes: [],
      links: [],
    };
  }

  const graphData = {
    nodes,
    links,
  };
  return graphData;
};

export const getSimilarPoints = async (qdrantClient, { collectionName, pointId, limit, filter, using }) => {
  const { points } = await qdrantClient.query(collectionName, {
    query: pointId,
    limit: limit,
    with_payload: true,
    with_vector: false,
    filter,
    using,
  });

  return points;
};

export const getFirstPoint = async (qdrantClient, { collectionName, filter }) => {
  const { points } = await qdrantClient.scroll(collectionName, {
    limit: 1,
    with_payload: true,
    with_vector: false,
    filter,
  });

  if (!points.length) {
    return null;
  }

  return points[0];
};

const getPointsWithPayload = async (qdrantClient, { collectionName, pointIds }) => {
  const points = await qdrantClient.retrieve(collectionName, {
    ids: pointIds,
    with_payload: true,
    with_vector: false,
  });

  return points;
};

export const getSamplePoints = async ({ collectionName, filter, sample, using, limit }) => {
  // ToDo: replace it with qdrantClient when it will be implemented

  const response = await axiosInstance({
    method: 'POST',
    url: `collections/${collectionName}/points/search/matrix/pairs`,
    data: {
      filter,
      sample,
      using,
      limit,
    },
  });

  return response.data.result.pairs;
};

export const deduplicatePoints = (existingPoints, foundPoints) => {
  // Returns array of found points that are not in existing points
  // deduplication is done by id
  const existingIds = new Set(existingPoints.map((point) => point.id));
  return foundPoints.filter((point) => !existingIds.has(point.id));
};
