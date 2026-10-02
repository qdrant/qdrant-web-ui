import { describe, it, expect, afterEach, vi } from 'vitest';
import { AxiosError } from 'axios';
import { axiosInstance } from '../../../common/axios';
import { requestFromCode } from './RequesFromCode';

// Replaces only the HTTP transport: axios applies its response transforms to the raw body, as with a real server.
const respondWith = (status, data) => {
  axiosInstance.defaults.adapter = (config) => {
    const response = { status, statusText: '', data, headers: {}, config };
    if (status < 400) {
      return Promise.resolve(response);
    }
    return Promise.reject(
      new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, null, response)
    );
  };
};

describe('requestFromCode', () => {
  const originalAdapter = axiosInstance.defaults.adapter;

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('returns the parsed body of a successful response', async () => {
    respondWith(200, '{"result":{"collections":[]},"status":"ok"}');

    expect(await requestFromCode('GET collections', false)).toEqual({ result: { collections: [] }, status: 'ok' });
  });

  it('returns the Qdrant error status of a JSON error response', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    respondWith(404, '{"status":{"error":"Not found: Collection `foo` doesn\'t exist!"},"time":0.1}');

    expect(await requestFromCode('GET collections/foo', false)).toEqual({
      error: "Not found: Collection `foo` doesn't exist!",
    });
  });

  it('returns the error text of a plain-text error response', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    respondWith(401, 'Must provide an API key or an Authorization bearer token');

    expect(await requestFromCode('GET collections', false)).toEqual({
      error: 'Must provide an API key or an Authorization bearer token',
    });
  });
});
