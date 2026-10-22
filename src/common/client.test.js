import { describe, it, expect, afterEach, vi } from 'vitest';
import { QdrantClientExtended } from './client.js';

// tests for QdrantClientExtended
describe('QdrantClientExtended', () => {
  describe('downloadSnapshot', () => {
    it('fetch should be called with correct arguments', async () => {
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);
      const fetchSpy = vi.spyOn(global, 'fetch');
      const controller = new AbortController();

      const apiKey = 'test-api-key';
      const url = 'https://localhost';
      const port = 3000;

      const collectionName = 'demo';
      const snapshotName = 'test-snapshot';

      const client = new QdrantClientExtended({
        url,
        apiKey,
        port,
      });
      await client.downloadSnapshot(collectionName, snapshotName);

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Extract the actual arguments
      const [actualRequest, actualOptions] = fetchSpy.mock.calls[0];

      // Check the URL and method
      expect(actualRequest.url).toBe(`${url}/collections/${collectionName}/snapshots/${snapshotName}`);
      expect(actualRequest.method).toBe('GET');

      // Check the headers
      expect(actualRequest.headers.get('Content-Disposition')).toBe(`attachment; filename="${snapshotName}"`);
      expect(actualRequest.headers.get('Content-Type')).toBe('application/gzip');
      expect(actualRequest.headers.get('api-key')).toBe(apiKey);
    });

    it('fetch should keep the path of the url', async () => {
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);

      const client = new QdrantClientExtended({
        url: 'https://localhost/qdrant/',
        apiKey: 'test-api-key',
        port: 443,
      });
      await client.downloadSnapshot('demo', 'test-snapshot');

      const [actualRequest] = fetch.mock.calls[0];
      expect(actualRequest.url).toBe('https://localhost/qdrant/collections/demo/snapshots/test-snapshot');
    });
  });

  describe('api requests', () => {
    const collectionsResponse = () =>
      new Response(JSON.stringify({ result: { collections: [] }, status: 'ok', time: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });

    it('should be sent to the root of the url', async () => {
      const fetch = vi.fn().mockImplementation(async () => collectionsResponse());
      vi.stubGlobal('fetch', fetch);

      const client = new QdrantClientExtended({ url: 'http://localhost:6333/', port: 6333 });
      await client.getCollections();

      expect(String(fetch.mock.calls[0][0])).toBe('http://localhost:6333/collections');
    });

    it('should be sent under the path of the url', async () => {
      const fetch = vi.fn().mockImplementation(async () => collectionsResponse());
      vi.stubGlobal('fetch', fetch);

      const client = new QdrantClientExtended({ url: 'https://example.com/qdrant/', port: 443 });
      await client.getCollections();

      expect(String(fetch.mock.calls[0][0])).toBe('https://example.com:443/qdrant/collections');
    });

    it('should keep the port of the url', async () => {
      const fetch = vi.fn().mockImplementation(async () => collectionsResponse());
      vi.stubGlobal('fetch', fetch);

      const client = new QdrantClientExtended({ url: 'http://example.com:8080/a/b/', port: 80 });
      await client.getCollections();

      expect(String(fetch.mock.calls[0][0])).toBe('http://example.com:8080/a/b/collections');
    });
  });

  // test for getSnapshotUploadUrl
  describe('getSnapshotUploadUrl', () => {
    // method returns url
    it('should return url', () => {
      const client = new QdrantClientExtended({
        url: 'https://localhost',
        apiKey: 'test',
        port: 3000,
      });

      expect(client.getSnapshotUploadUrl('test').href).toBe(
        new URL('collections/test/snapshots/upload', 'https://localhost').href
      );
    });

    it('should keep the path of the url', () => {
      const client = new QdrantClientExtended({
        url: 'https://localhost/qdrant/',
        apiKey: 'test',
        port: 443,
      });

      expect(client.getSnapshotUploadUrl('test').href).toBe(
        'https://localhost/qdrant/collections/test/snapshots/upload'
      );
    });
  });

  // test for getApiKey
  describe('getApiKey', () => {
    // method returns apiKey
    it('should return apiKey', () => {
      const client = new QdrantClientExtended({
        url: 'https://localhost',
        apiKey: 'test',
        port: 3000,
      });

      expect(client.getApiKey()).toEqual('test');
    });
  });

  // clear fetch mock
  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
