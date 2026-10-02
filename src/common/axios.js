import axios from 'axios';
import { getBaseURL } from './utils';
import { bigIntJSON } from './bigIntJSON';

// Not every response is JSON: e.g. auth errors (401/403) come back as plain text.
// Throwing here would replace the AxiosError (with its status and response) by a bare SyntaxError,
// so a body that can't be parsed is passed through as is.
function parseResponse(data) {
  if (!data) {
    return data;
  }
  try {
    return bigIntJSON.parse(data);
  } catch {
    return data;
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:6333' : getBaseURL(),
  transformRequest: [
    function (data, headers) {
      if (data instanceof FormData) {
        return data;
      }
      headers['Content-Type'] = 'application/json';
      headers['x-inference-proxy'] = 'true';
      return bigIntJSON.stringify(data);
    },
  ],
  transformResponse: [parseResponse],
});

export function setupAxios(axios, { apiKey }) {
  if (process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = 'http://localhost:6333';
  } else {
    axios.defaults.baseURL = getBaseURL();
  }
  if (apiKey) {
    axios.defaults.headers.common['api-key'] = apiKey;
  } else {
    delete axios.defaults.headers.common['api-key'];
  }
  axios.defaults.transformRequest = [
    function (data, headers) {
      if (data instanceof FormData) {
        return data;
      }
      headers['Content-Type'] = 'application/json';
      headers['x-inference-proxy'] = 'true';
      return bigIntJSON.stringify(data);
    },
  ];
  axios.defaults.transformResponse = [parseResponse];
}
