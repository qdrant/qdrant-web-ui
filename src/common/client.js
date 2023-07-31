import { QdrantClient } from '@qdrant/js-client-rest';

export default function qdrantClient({ apiKey }) {
  let url;
  let port = 6333;
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:6333';
  } else {
    url = window.location.href;
    if (window.location.port) {
      port = window.location.port;
    } else {
      if (window.location.protocol === 'https:') {
        port = 443;
      } else {
        port = 80;
      }
    }
  }

  const options = {
    url,
    apiKey,
    port,
  };

  return new QdrantClient(options);
}
