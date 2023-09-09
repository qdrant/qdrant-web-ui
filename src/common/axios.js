import axios from 'axios';
import { getBaseURL } from './utils';

function setupAxios({ apiKey }) {
  if (process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = 'http://localhost:6333';
  } else {
    axios.defaults.baseURL = getBaseURL();
  }
  if (apiKey) {
    axios.defaults.headers.common['api-key'] = apiKey;
  }
}

export default setupAxios;
