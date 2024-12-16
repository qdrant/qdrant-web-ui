export const initGraph = async (
  qdrantClient,
  { collectionName, initNode, limit, filter, using, sampleLinks, tree = false }
) => {
  let nodes = [];
  let links = [];

  if (sampleLinks) {
    const uniquePoints = new Set();

    for (const link of sampleLinks) {
      links.push({ source: link.a, target: link.b, score: link.score });
      uniquePoints.add(link.a);
      uniquePoints.add(link.b);
    }

    if (tree) {
      // ToDo acs should depend on metric type
      links = getMinimalSpanningTree(links, true);
    }

    nodes = await getPointsWithPayload(qdrantClient, { collectionName, pointIds: Array.from(uniquePoints) });
  } else if (initNode) {
    initNode.clicked = true;
    nodes = await getSimilarPoints(qdrantClient, { collectionName, pointId: initNode.id, limit, filter, using });
    links = nodes.map((point) => ({ source: initNode.id, target: point.id, score: point.score }));
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

export const getSamplePoints = async (qdrantClient, { collectionName, filter, sample, using, limit }) => {
  const response = await qdrantClient.searchMatrixPairs(collectionName, {
    filter,
    sample,
    using,
    limit,
  });

  return response.pairs;
};

export const deduplicatePoints = (existingPoints, foundPoints) => {
  // Returns array of found points that are not in existing points
  // deduplication is done by id
  const existingIds = new Set(existingPoints.map((point) => point.id));
  return foundPoints.filter((point) => !existingIds.has(point.id));
};

export const getMinimalSpanningTree = (links, acs = true) => {
  // Sort links by score (assuming each link has a score property)

  let sortedLinks = [];
  if (acs) {
    sortedLinks = links.sort((a, b) => b.score - a.score);
  } else {
    sortedLinks = links.sort((a, b) => a.score - b.score);
  }
  // Helper function to find the root of a node
  const findRoot = (parent, i) => {
    if (parent[i] === i) {
      return i;
    }
    return findRoot(parent, parent[i]);
  };

  // Helper function to perform union of two sets
  const union = (parent, rank, x, y) => {
    const rootX = findRoot(parent, x);
    const rootY = findRoot(parent, y);

    if (rank[rootX] < rank[rootY]) {
      parent[rootX] = rootY;
    } else if (rank[rootX] > rank[rootY]) {
      parent[rootY] = rootX;
    } else {
      parent[rootY] = rootX;
      rank[rootX]++;
    }
  };

  const parent = {};
  const rank = {};
  const mstLinks = [];

  // Initialize parent and rank arrays
  links.forEach((link) => {
    parent[link.source] = link.source;
    parent[link.target] = link.target;
    rank[link.source] = 0;
    rank[link.target] = 0;
  });

  // Kruskal's algorithm
  sortedLinks.forEach((link) => {
    const sourceRoot = findRoot(parent, link.source);
    const targetRoot = findRoot(parent, link.target);

    if (sourceRoot !== targetRoot) {
      mstLinks.push(link);
      union(parent, rank, sourceRoot, targetRoot);
    }
  });

  return mstLinks;
};

//  the function which returns metric for given collection and name of the vector

export const getMetrics = async (qdrantClient, { collectionName }) => {
  const metricConfig = {};
  try {
    const collectionInfo = await qdrantClient.getCollection(collectionName);
    Object.keys(collectionInfo.config.params.vectors).map((key) => {
      if (typeof collectionInfo.config.params.vectors[key] === 'object') {
        metricConfig[key] = collectionInfo.config.params.vectors[key].distance;
      } else {
        metricConfig[''] = collectionInfo.config.params.vectors.distance;
      }
    });
    return metricConfig;
  } catch (e) {
    console.error(e);
  }
};
