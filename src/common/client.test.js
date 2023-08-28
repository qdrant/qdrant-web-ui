import { describe, it, expect, afterEach, vi } from 'vitest';
import { QdrantClientExtended } from './client.js';

// tests for QdrantClientExtended
describe('QdrantClientExtended', () => {
  describe('downloadSnapshot', () => {
    it('fetch should be called with correct arguments', async () => {
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);
      vi.spyOn(global, 'fetch');

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

      // check that fetch was called with correct arguments
      expect(fetch).toHaveBeenCalledWith(
        new Request(`${url}/collections/${collectionName}/snapshots/${snapshotName}`, {
          method: 'GET',
          headers: {
            'Content-Disposition': `attachment; filename="${snapshotName}"`,
            'Content-Type': 'application/gzip',
            'api-key': apiKey,
          },
        })
      );
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
