import axios from 'axios';

export async function requestFromCode(text, collectionName) {
  const data = codeParse(text);
  if (data.error) {
    return data;
  } else {
    // Sending request
    const colorBy = data.reqBody.color_by;
    if (colorBy?.payload) {
      return await actionFromCode(collectionName, data, 'scroll');
    } else if ((data, colorBy?.discover_score)) {
      return discoverFromCode(collectionName, data);
    } else {
      return await actionFromCode(collectionName, data, 'scroll');
    }
  }
}

async function actionFromCode(collectionName, data, action) {
  try {
    const response = await axios({
      method: 'POST',
      url: `collections/${collectionName}/points/${action || 'scroll'}`,
      data: data.reqBody,
    });
    response.data.color_by = data.reqBody.color_by;
    response.data.vector_name = data.reqBody.vector_name;
    return {
      data: response.data,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err.response?.data?.status ? err.response?.data?.status : err,
    };
  }
}

async function discoverFromCode(collectionName, data) {
  // Do 20/80 split. 20% of the points will be returned with the query
  // and 80 % will be returned with random sampling
  const queryLimit = Math.floor(data.reqBody.limit * 0.2);
  const randomLimit = data.reqBody.limit - queryLimit;
  data.reqBody.limit = queryLimit;
  data.reqBody.with_payload = true;

  const queryResponse = await actionFromCode(collectionName, data, 'discover');
  if (queryResponse.error) {
    return {
      data: null,
      error: queryResponse.error,
    };
  }

  // Add tag to know which points were returned by the query
  queryResponse.data.result.forEach((point) => {
    point.from_query = true;
  });

  // Get "random" points ids.
  // There is no sampling endpoint in Qdrant yet, so for now we just scroll excluding the previous results
  const idsToExclude = queryResponse.data.result.map((point) => point.id);

  const originalFilter = data.reqBody.filter;
  const mustNotFilter = [{ has_id: idsToExclude }];
  data.reqBody.filter = originalFilter || {};
  data.reqBody.filter.must_not = mustNotFilter.concat(data.reqBody.filter?.must_not || []);

  data.reqBody.limit = randomLimit;
  const randomResponse = await actionFromCode(collectionName, data, 'scroll');
  if (randomResponse.error) {
    return {
      data: null,
      error: randomResponse.error,
    };
  }

  // Then score these random points
  const idsToInclude = randomResponse.data.result.points.map((point) => point.id);
  const mustFilter = [{ has_id: idsToInclude }];
  data.reqBody.filter = originalFilter || {};
  data.reqBody.filter.must = mustFilter.concat(data.reqBody.filter?.must || []);

  const scoredRandomResponse = await actionFromCode(collectionName, data, 'discover');
  if (scoredRandomResponse.error) {
    return {
      data: null,
      error: scoredRandomResponse.error,
    };
  }

  // Concat both results
  const points = queryResponse.data.result.concat(scoredRandomResponse.data.result);

  return {
    data: {
      ...queryResponse.data,
      result: {
        points: points,
      },
    },
    error: null,
  };
}

export function codeParse(codeText) {
  let reqBody = {};

  // Parse JSON
  if (codeText) {
    try {
      reqBody = JSON.parse(codeText);
    } catch (e) {
      return {
        reqBody: codeText,
        error: 'Fix the position brackets to run & check the json',
      };
    }
  }

  // Validate color_by
  if (reqBody.color_by) {
    const colorBy = reqBody.color_by;

    if (typeof colorBy === 'string') {
      // Parse into payload variant
      reqBody.color_by = {
        payload: colorBy,
      };
    } else {
      // Check we only have one of the options: payload, or discover_score
      const options = [colorBy.payload, colorBy.discover_score];
      const optionsCount = options.filter((option) => option).length;
      if (optionsCount !== 1) {
        return {
          reqBody: reqBody,
          error: '`color_by`: Only one of `payload`, or `discover_score` can be used',
        };
      }

      // Put search arguments in main request body
      if (colorBy.discover_score) {
        reqBody = {
          ...reqBody,
          ...colorBy.discover_score,
        };
      }
    }
  }

  // Set with_vector name
  if (reqBody.vector_name) {
    reqBody.with_vector = [reqBody.vector_name];
    return {
      reqBody: reqBody,
      error: null,
    };
  } else if (!reqBody.vector_name) {
    reqBody.with_vector = true;
    return {
      reqBody: reqBody,
      error: null,
    };
  }
}
