import axios from 'axios';
import { getBaseURL } from './utils';
import { bigIntJSON } from './bigIntJSON';

function setupAxios({ apiKey }) {
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
      return bigIntJSON.stringify(data);
    },
  ];
  axios.defaults.transformResponse = [
    function (data) {
      return bigIntJSON.parse(data);
    },
  ];
}

export default setupAxios;
