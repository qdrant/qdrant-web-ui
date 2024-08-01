export const checkIndexAccuracy = async (client, collectionName, idx, vectorName = null) => {
  const LIMIT = 10;
  const TIMEOUT = 20000;

  try {
    const exact = await client.query(collectionName, {
      limit: LIMIT,
      with_payload: false,
      with_vectors: false,
      query: idx,
      params: {
        exact: true,
      },
      using: vectorName,
      timeout: TIMEOUT,
    });

    const hnsw = await client.query(collectionName, {
      timeout: TIMEOUT,
      limit: LIMIT,
      with_payload: false,
      with_vectors: false,
      query: idx,
      params: {
        exact: false,
      },
      using: vectorName,
    });

    const exactIds = exact.points.map((item) => item.id);
    const hnswIds = hnsw.points.map((item) => item.id);

    return exactIds.filter((id) => hnswIds.includes(id)).length / exactIds.length;
  } catch (e) {
    console.error('Error: ', e);
    console.error('Skipping point: ', idx);
    // todo: throw error
    return null;
  }
};
