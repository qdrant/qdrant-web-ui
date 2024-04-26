import axios from 'axios';
import { getBaseURL, getPathHeader } from './utils';
import { bigIntJSON } from './bigIntJSON';

function setupAxios({ apiKey }) {
  axios.defaults.baseURL = getBaseURL();
  const pathHeader = getPathHeader();
  if (pathHeader) {
    axios.defaults.headers.common['x-route-service'] = pathHeader;
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
