export const initGraph = async (qdrantClient, {collectionName, initNode, limit, filter, using}) => {
  if (!initNode) {
    return {
      nodes: [],
      links: [],
    };
  }
  initNode.clicked = true;

  const points = await getSimilarPoints(qdrantClient, {collectionName, pointId: initNode.id, limit, filter, using});

  return {
    nodes: [initNode, ...points],
    links: points.map((point) => ({source: initNode.id, target: point.id})),
  };
}

export const getSimilarPoints = async (qdrantClient, {collectionName, pointId, limit, filter, using}) => {
  const {points} = await qdrantClient.query(collectionName, {
    query: pointId,
    limit: limit,
    with_payload: true,
    with_vector: false,
    filter,
    using,
  });

  return points;
}

export const getFirstPoint = async (qdrantClient, {collectionName, filter}) => {
  const {points} = await qdrantClient.scroll(collectionName, {
    limit: 1,
    with_payload: true,
    with_vector: false,
    filter,
  });

  if (!points.length) {
    return null;
  }

  return points[0];
}

export const deduplicatePoints = (existingPoints, foundPoints) => {
  // Returns array of found points that are not in existing points
  // deduplication is done by id
  const existingIds = new Set(existingPoints.map((point) => point.id));
  return foundPoints.filter((point) => !existingIds.has(point.id));
}
