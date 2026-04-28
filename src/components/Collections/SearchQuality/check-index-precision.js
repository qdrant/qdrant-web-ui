export const checkIndexRecall = async (
  client,
  collectionName,
  pointId,
  logFoo,
  idx,
  total,
  filter = null,
  params = null,
  vectorName = null,
  limit = 10,
  timeout = 20
) => {
  const exclusionFilter = { must_not: [{ has_id: [pointId] }] };
  const queryFilter = filter ? { must: [filter, exclusionFilter] } : exclusionFilter;

  try {
    const exact = await client.api().queryPoints({
      collection_name: collectionName,
      limit: limit,
      with_payload: false,
      with_vectors: false,
      query: pointId,
      params: {
        exact: true,
      },
      filter: queryFilter,
      using: vectorName,
      timeout,
    });

    const exactSearchElapsed = Math.round(exact.data.time * 1000);

    const hnsw = await client.api().queryPoints({
      collection_name: collectionName,
      timeout,
      limit: limit,
      with_payload: false,
      with_vectors: false,
      query: pointId,
      params: params,
      filter: queryFilter,
      using: vectorName,
    });

    const searchElapsed = Math.round(hnsw.data.time * 1000);

    const exactIds = exact.data.result.points.map((item) => item.id);
    const hnswIds = hnsw.data.result.points.map((item) => item.id);

    const recall = exactIds.filter((id) => hnswIds.includes(id)).length / exactIds.length;

    logFoo &&
      logFoo(
        `Point ${pointId} (${idx + 1}/${total}) recall@${limit}: ${recall} (search time: "exact" ${exactSearchElapsed}ms; "regular" ${searchElapsed}ms)`
      );

    return recall;
  } catch (e) {
    console.error('Error: ', e);
    console.error('Skipping point: ', idx);
    // todo: throw error
    return null;
  }
};
