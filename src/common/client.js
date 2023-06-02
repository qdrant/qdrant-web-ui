import { QdrantClient } from '@qdrant/js-client-rest';



export default function qdrantClient({ apiKey }) {
  let url;
  if (process.env.NODE_ENV === "development") {
    url = "http://localhost:6333";
  } else {
    url = window.location.href;
  }

  let options = {
    url,
    apiKey
  };

  return new QdrantClient(options)
}
