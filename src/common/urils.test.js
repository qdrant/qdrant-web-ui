import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBaseURL, getQdrantPrefix, pumpFile, updateProgress } from './utils';

describe('utils', () => {
  describe('getBaseURL', () => {
    it('should return base url', () => {
      const window = {
        location: {
          href: 'http://localhost:63342/dashboard',
        },
      };
      vi.stubGlobal('window', window);

      const result = 'http://localhost:63342/';

      expect(getBaseURL()).toEqual(result);
    });

    it('should return base url with pathname', () => {
      const window = {
        location: {
          href: 'http://localhost:63342/myapp/dashboard',
        },
      };
      vi.stubGlobal('window', window);

      const result = 'http://localhost:63342/myapp/';

      expect(getBaseURL()).toEqual(result);
    });

    it('should return base url when pathname has trailing slash after dashboard', () => {
      const window = {
        location: {
          href: 'https://example.com/myapp/dashboard/',
          origin: 'https://example.com',
        },
      };
      vi.stubGlobal('window', window);

      const result = 'https://example.com/myapp/';

      expect(getBaseURL()).toEqual(result);
    });
  });

  describe('getQdrantPrefix', () => {
    it('should derive prefix from dashboard URL', () => {
      const window = {
        location: {
          href: 'https://example.com/instance1/dashboard',
        },
      };
      vi.stubGlobal('window', window);

      expect(getQdrantPrefix()).toEqual('/instance1');
    });

    it('should return empty prefix for root dashboard URL', () => {
      const window = {
        location: {
          href: 'https://example.com/dashboard',
        },
      };
      vi.stubGlobal('window', window);

      expect(getQdrantPrefix()).toEqual('');
    });
  });

  describe('pumpFile', () => {
    it('should return chunks', async () => {
      let readNumber = 0;
      const reader = {
        read: () => {
          readNumber += 1;
          if (readNumber < 3) {
            return Promise.resolve({ done: false, value: `test${readNumber}` });
          } else {
            return Promise.resolve({ done: true });
          }
        },
      };
      const callback = () => {};
      const chunks = [];
      const result = await pumpFile(reader, callback, chunks);
      expect(result).toEqual(['test1', 'test2']);
    });
  });

  describe('updateProgress', () => {
    it('should pass progress in percents in callback', () => {
      const snapshotSize = 10;
      let result = 0;
      const callback = (value) => {
        result += value;
      };
      updateProgress(snapshotSize, callback)(1);
      expect(result).toEqual(10);
      updateProgress(snapshotSize, callback)(1);
      expect(result).toEqual(20);
    });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
