import axios from "axios";

function setupAxios({ apiURL, apiKey }) {
  axios.defaults.baseURL = apiURL;
  axios.defaults.headers.common["api-key"] = apiKey;
}

export default setupAxios;
