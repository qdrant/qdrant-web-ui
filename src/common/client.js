import { QdrantClient } from '@qdrant/js-client-rest';

class QdrantClientExtended extends QdrantClient {
  // class will extend the base class QdrantClient and will have two methods:
  // 1. downloadSnapshot
  // 2. uploadSnapshot

  // constructor will have the same signature as QdrantClient
  constructor({ url, apiKey, port }) {
    super({ url, apiKey, port });

    this.downloadSnapshot = this.downloadSnapshot.bind(this);
    this.uploadSnapshot = this.uploadSnapshot.bind(this);

    this.url = url;
    this.apiKey = apiKey;
    this.port = port;
  }

  /**
   * Download snapshot from the server
   * @param {string} collectionName - name of the collection
   * @param {string} snapshotName - name of the snapshot
   * @param {boolean} blob - return blob instead of response, default false
   * @return {Promise<any>} - promise with response or blob
   * @example <caption>Download snapshot</caption>
   * const response = await client.downloadSnapshot('collection', 'snapshot');
   * const blob = await client.downloadSnapshot('collection', 'snapshot', true);
   */
  async downloadSnapshot(collectionName, snapshotName, blob=false) {
    const headers = {
      'Content-Disposition': `attachment; filename="${snapshotName}"`,
      'Content-Type': 'application/gzip',
    };

    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    console.log('URL', `${this.url}/collections/${collectionName}/snapshots/${snapshotName}`);

    const request = new Request(
      `${this.url}/collections/${collectionName}/snapshots/${snapshotName}`,
      {
        method: 'GET',
        headers,
      });

    const response = await fetch(request);

    if (blob) {
      return  await response.blob();
    }

    return response;
  }

  async uploadSnapshot() {
    // upload snapshot to the server
    // return snapshot id
  }

}

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

  return new QdrantClientExtended(options);
}
