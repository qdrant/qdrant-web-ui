export const checkIndexAccuracy = async (client, collectionName, idx, vectorName = null) => {
  const LIMIT = 10;
  const TIMEOUT = 20000;

  try {
    const exact = await client.recommend(collectionName, {
      limit: LIMIT,
      with_payload: false,
      with_vectors: false,
      positive: [idx],
      params: {
        exact: true,
      },
      using: vectorName,
      timeout: TIMEOUT,
    });

    const hnsw = await client.recommend(collectionName, {
      timeout: TIMEOUT,
      limit: LIMIT,
      with_payload: false,
      with_vectors: false,
      positive: [idx],
      params: {
        exact: false,
      },
      using: vectorName,
    });

    const exactIds = exact.map((item) => item.id);
    const hnswIds = hnsw.map((item) => item.id);

    return exactIds.filter((id) => hnswIds.includes(id)).length / exactIds.length;
  } catch (e) {
    console.error('Error: ', e);
    console.error('Skipping point: ', idx);
    return null;
  }
};
