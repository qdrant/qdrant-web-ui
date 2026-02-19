/* eslint-disable camelcase */

export function requestData(
  qdrantClient,
  collectionName,
  { limit, filter = null, using = null, color_by = null, method = null }
) {
  // --------------------------------------------------
  // HNSW-based visualization request
  // --------------------------------------------------
  if (method === 'hnsw') {
    /**
     * HNSW visualization does NOT require vectors.
     * Backend is expected to return precomputed 2D points.
     */
    return qdrantClient.http.post(
      `/collections/${collectionName}/visualize`,
      {
        method: 'hnsw',
        limit,
        filter,
      }
    );
  }

  // --------------------------------------------------
  // Query-based coloring (query / discover)
  // --------------------------------------------------
  if (color_by?.query) {
    const query = {
      query: color_by.query,
      limit: limit,
      filter: filter,
      with_vector: using ? [using] : true,
      with_payload: true,
      using: using ?? null,
    };

    return qdrantClient.query(collectionName, query);
  }

  // --------------------------------------------------
  // Default: scroll request
  // --------------------------------------------------
  const scrollQuery = {
    limit: limit,
    filter: filter,
    with_vector: using ? [using] : true,
    with_payload: true,
  };

  return qdrantClient.scroll(collectionName, scrollQuery);
}
