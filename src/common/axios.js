import axios from "axios";

function setupAxios({apiKey}) {
  if (process.env.NODE_ENV === "development") {
    axios.defaults.baseURL = "http://localhost:6333";
  }
}

export default setupAxios;
