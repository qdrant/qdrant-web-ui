import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from './get-error-message';

// Shaped like the errors of the Qdrant client (openapi-typescript-fetch ApiError).
const apiError = (status, data, statusText = 'Error') =>
  Object.assign(new Error(statusText), { getActualType: () => ({ status, data }) });

const axiosError = (status, data) =>
  new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', {}, null, { status, data });

const qdrantBody = { status: { error: 'Wrong input: bad shard' }, time: 0 };
const authText = 'Must provide an API key or an Authorization bearer token';

describe('getErrorMessage', () => {
  describe.each([
    ['Qdrant client error', apiError],
    ['axios error', axiosError],
  ])('%s', (_name, makeError) => {
    it('returns the Qdrant error message', () => {
      expect(getErrorMessage(makeError(400, qdrantBody))).toBe('Wrong input: bad shard');
    });

    it('returns a plain-text error body', () => {
      expect(getErrorMessage(makeError(401, authText))).toBe(authText);
    });

    it('falls back to the error message when the body has no message', () => {
      expect(getErrorMessage(makeError(500, ''))).toBe(makeError(500, '').message);
    });

    it('hides auth errors without an API key and reports an invalid one', () => {
      expect(getErrorMessage(makeError(401, authText), { withApiKey: { apiKey: '' } })).toBeNull();
      expect(getErrorMessage(makeError(403, authText), { withApiKey: { apiKey: 'key' } })).toBe(
        'Your API key is invalid. Please, set a new one.'
      );
    });
  });

  it('returns the message of a regular error', () => {
    expect(getErrorMessage(new Error('Network down'))).toBe('Network down');
  });

  it('returns the fallback message for an error without one', () => {
    expect(getErrorMessage(undefined, { fallbackMessage: 'Oops.' })).toBe('Oops.');
    expect(getErrorMessage({})).toBe('Something went wrong.');
  });

  it('returns the message of an axios error without a response', () => {
    expect(getErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('Network Error');
  });
});
