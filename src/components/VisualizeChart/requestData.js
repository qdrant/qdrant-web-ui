/* eslint-disable camelcase */
export function requestData(qdrantClient, collectionName, { limit, filter = null, using = null, color_by = null }) {
  // Based on the input parameters, we need to decide what kind of request we need to send
  // By default we should do scroll request
  // But if we have color_by field which uses query, it should be used instead

  if (color_by?.query) {
    const query = {
      query: color_by.query,
      limit: limit,
      filter: filter,
      with_vector: using ? [using] : true,
      with_payload: true,
    };

    return qdrantClient.query(collectionName, query);
  }

  // It it's not a query, we should do a scroll request

  const scrollQuery = {
    limit: limit,
    filter: filter,
    with_vector: using ? [using] : true,
    with_payload: true,
  };

  return qdrantClient.scroll(collectionName, scrollQuery);
}
