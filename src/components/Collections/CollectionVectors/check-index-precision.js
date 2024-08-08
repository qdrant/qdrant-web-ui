export const checkIndexPrecision = async (
  client,
  collectionName,
  pointId,
  logFoo,
  idx,
  total,
  vectorName = null,
  limit = 10
) => {
  const TIMEOUT = 20;

  try {
    const exactSearchtartTime = new Date().getTime();

    const exact = await client.query(collectionName, {
      limit: limit,
      with_payload: false,
      with_vectors: false,
      query: pointId,
      params: {
        exact: true,
      },
      using: vectorName,
      timeout: TIMEOUT,
    });

    const exactSearchElapsed = new Date().getTime() - exactSearchtartTime;

    const searchStartTime = new Date().getTime();

    const hnsw = await client.query(collectionName, {
      timeout: TIMEOUT,
      limit: limit,
      with_payload: false,
      with_vectors: false,
      query: pointId,
      params: {
        exact: false,
      },
      using: vectorName,
    });

    const searchElapsed = new Date().getTime() - searchStartTime;

    const exactIds = exact.points.map((item) => item.id);
    const hnswIds = hnsw.points.map((item) => item.id);

    const precision = exactIds.filter((id) => hnswIds.includes(id)).length / exactIds.length;

    logFoo &&
      logFoo(
        'Point ID ' +
          idx +
          '(' +
          idx +
          '/' +
          total +
          ') precision@' +
          limit +
          ': ' +
          precision +
          ' (search time exact: ' +
          exactSearchElapsed +
          'ms, regular: ' +
          searchElapsed +
          'ms)'
      );

    return precision;
  } catch (e) {
    console.error('Error: ', e);
    console.error('Skipping point: ', idx);
    // todo: throw error
    return null;
  }
};
