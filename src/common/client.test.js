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
      const url = 'http://localhost';
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
  });

  // test for getSnapshotUploadUrl
  describe('getSnapshotUploadUrl', () => {
    // method returns url
    it('should return url', () => {
      const client = new QdrantClientExtended({
        url: 'http://localhost',
        apiKey: 'test',
        port: 3000,
      });

      expect(client.getSnapshotUploadUrl('test').href).toBe(
        new URL('collections/test/snapshots/upload', 'http://localhost').href
      );
    });
  });

  // test for getApiKey
  describe('getApiKey', () => {
    // method returns apiKey
    it('should return apiKey', () => {
      const client = new QdrantClientExtended({
        url: 'http://localhost',
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
