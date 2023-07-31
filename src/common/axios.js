import axios from 'axios';

function setupAxios({ apiKey }) {
  if (process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = 'http://localhost:6333';
  }
  if (apiKey) {
    axios.defaults.headers.common['api-key'] = apiKey;
  }
}

export default setupAxios;
