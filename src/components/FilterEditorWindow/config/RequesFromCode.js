import axios from 'axios';

export function requestFromCode(text, collectionName) {
  const data = codeParse(text);
  if (data.error) {
    return data;
  } else {
    // Sending request

    return axios({
      method: 'POST',
      url: `collections/${collectionName}/points/scroll`,
      data: data.reqBody,
    })
      .then((response) => {
        response.data.color_by = data.reqBody.color_by;
        response.data.vector_name = data.reqBody.vector_name;
        return {
          data: response.data,
          error: null,
        };
      })
      .catch((err) => {
        return {
          data: null,
          error: err.response?.data?.status ? err.response?.data?.status : err,
        };
      });
  }
}

export function codeParse(codeText) {
  let reqBody = {};
  if (codeText) {
    try {
      reqBody = JSON.parse(codeText);
    } catch (e) {
      return {
        reqBody: codeText,
        error: 'Fix the Position brackets to run & check the json',
      };
    }
  }
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
