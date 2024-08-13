import axios from 'axios';
import { getBaseURL } from './utils';
import { bigIntJSON } from './bigIntJSON';

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
  transformResponse: [
    function (data) {
      return bigIntJSON.parse(data);
    },
  ],
});

export function setupAxios(axios, { apiKey }) {
  if (process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = 'http://localhost:6333';
  } else {
    axios.defaults.baseURL = getBaseURL();
  }
  if (apiKey) {
    axios.defaults.headers.common['api-key'] = apiKey;
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
  axios.defaults.transformResponse = [
    function (data) {
      return bigIntJSON.parse(data);
    },
  ];
}
