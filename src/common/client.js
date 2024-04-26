import { QdrantClient } from '@qdrant/js-client-rest';
import { getBaseURL, getPathHeader } from './utils';

/**
 * Extended QdrantClient class with additional methods
 * @class
 * @extends QdrantClient
 */
export class QdrantClientExtended extends QdrantClient {
  #downloadController;
  constructor({ url, apiKey, port, headers }) {
    super({ url, apiKey, port, headers });

    this.downloadSnapshot = this.downloadSnapshot.bind(this);
    this.getSnapshotUploadUrl = this.getSnapshotUploadUrl.bind(this);
    this.getApiKey = this.getApiKey.bind(this);
    this.abortDownload = this.abortDownload.bind(this);

    this.url = url;
    this.apiKey = apiKey;
    this.port = port;
    this.headers = headers;

    this.#downloadController = new AbortController();
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
  async downloadSnapshot(collectionName, snapshotName, blob = false) {
    const headers = {
      'Content-Disposition': `attachment; filename="${snapshotName}"`,
      'Content-Type': 'application/gzip',
    };

    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }

    const snapshotUrl = new URL(`/collections/${collectionName}/snapshots/${snapshotName}`, this.url).href;

    const request = new Request(snapshotUrl, {
      method: 'GET',
      headers,
    });

    const response = await fetch(request, { signal: this.#downloadController.signal });

    if (blob) {
      return await response.blob();
    }

    return response;
  }

  abortDownload() {
    this.#downloadController.abort();
    this.#downloadController = new AbortController();
  }

  /**
   * Get url for snapshot upload
   * @param {string} collectionName
   * @return {module:url.URL} - URL object for snapshot upload
   */
  getSnapshotUploadUrl(collectionName) {
    return new URL(`collections/${collectionName}/snapshots/upload`, this.url);
  }

  /**
   * Get api key
   * @return {string} - api key
   */
  getApiKey() {
    return this.apiKey;
  }
}

export default function qdrantClient({ apiKey }) {
  const port = 443;
  const url = getBaseURL();
  const pathHeader = getPathHeader();
  const headers = {};
  if (pathHeader) {
    headers['x-route-service'] = pathHeader;
  }

  const options = {
    url,
    apiKey,
    port,
    headers,
  };

  return new QdrantClientExtended(options);
}
