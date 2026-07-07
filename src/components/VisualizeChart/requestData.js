/* eslint-disable camelcase */
import { DEFAULT_N_NEIGHBORS, resolveDistanceMetric } from '../../lib/knn-graph';

// Data source for the visualization: the server-side distance matrix
// (Qdrant >= 1.12). Qdrant samples `limit` points and computes a knn graph
// between them, so raw vectors never have to be transferred to the browser.
//
// The one exception is PCA, which fundamentally needs the raw vectors and
// is fed by a plain scroll request.

export async function requestData(qdrantClient, collectionName, params) {
  if (params.algorithm === 'PCA') {
    return await requestRawVectors(qdrantClient, collectionName, params);
  }
  return await requestMatrixData(qdrantClient, collectionName, params);
}

async function requestMatrixData(
  qdrantClient,
  collectionName,
  { limit, filter = null, using = null, color_by = null, n_neighbors = null, perplexity = null, highlight = null }
) {
  // t-SNE convention: the Gaussian kernel wants ~3x perplexity neighbors
  let knnLimit = n_neighbors ?? DEFAULT_N_NEIGHBORS;
  if (perplexity != null) {
    knnLimit = Math.max(knnLimit, Math.ceil(3 * perplexity));
  }

  const [collectionInfo, matrixResponse] = await Promise.all([
    qdrantClient.getCollection(collectionName),
    qdrantClient.searchMatrixOffsets(collectionName, {
      sample: limit,
      limit: knnLimit,
      filter,
      using: using ?? undefined,
    }),
  ]);

  const { ids } = matrixResponse;

  if (ids.length === 0) {
    return { points: [] };
  }

  // The matrix response contains ids only, payloads and scores for
  // query-based coloring are requested separately, without vectors.
  // Note: `color_by.query` can be a valid falsy value, e.g. point id 0
  const hasQueryColor = color_by != null && color_by.query !== undefined && color_by.query !== null;

  const [retrievedPoints, scoredPoints] = await Promise.all([
    qdrantClient.retrieve(collectionName, {
      ids,
      with_payload: true,
      with_vector: false,
    }),
    hasQueryColor
      ? qdrantClient
          .query(collectionName, {
            query: color_by.query,
            filter: { must: [{ has_id: ids }] },
            limit: ids.length,
            with_payload: false,
            with_vector: false,
            using: using ?? undefined,
          })
          .then((response) => response.points)
      : Promise.resolve(null),
  ]);

  const pointById = new Map(retrievedPoints.map((point) => [String(point.id), point]));

  if (scoredPoints) {
    let maxScore = -Infinity;
    for (const point of scoredPoints) {
      maxScore = Math.max(maxScore, point.score);
    }
    const scoreById = new Map(scoredPoints.map((point) => [String(point.id), point.score]));
    for (const [key, point] of pointById) {
      // A recommend-by-id query excludes the query point itself from the
      // results, while it can still be present in the sample - being
      // the query, it gets the top score
      point.score = scoreById.get(key) ?? maxScore;
    }
  }

  // Order of `points` must match the order of `ids`: row/col offsets
  // of the knn graph refer to positions in the `ids` array
  const points = ids.map((id) => pointById.get(String(id)) ?? { id, payload: {} });

  // 'highlight': emphasize sampled points matching an extra filter,
  // evaluated server-side against the sampled ids only
  let highlightIds = null;
  if (highlight?.filter) {
    const { points: matched } = await qdrantClient.scroll(collectionName, {
      filter: { must: [highlight.filter, { has_id: ids }] },
      limit: ids.length,
      with_payload: false,
      with_vector: false,
    });
    highlightIds = matched.map((point) => point.id);
  }

  return {
    points,
    graph: matrixResponse,
    metric: resolveDistanceMetric(collectionInfo, using),
    highlightIds,
  };
}

// Raw vectors, PCA only
async function requestRawVectors(
  qdrantClient,
  collectionName,
  { limit, filter = null, using = null, color_by = null }
) {
  if (color_by != null && color_by.query !== undefined && color_by.query !== null) {
    // Score-based coloring: the query provides both vectors and scores
    return await qdrantClient.query(collectionName, {
      query: color_by.query,
      limit: limit,
      filter: filter,
      with_vector: using ? [using] : true,
      with_payload: true,
      using: using ?? undefined,
    });
  }

  const scrollQuery = {
    limit: limit,
    filter: filter,
    with_vector: using ? [using] : true,
    with_payload: true,
  };

  return await qdrantClient.scroll(collectionName, scrollQuery);
}
