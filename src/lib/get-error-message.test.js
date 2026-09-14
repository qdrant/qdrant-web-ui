import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './get-error-message';

describe('getErrorMessage', () => {
  it('returns the fallback when the extracted API error message is empty', () => {
    const error = {
      message: 'Request error:',
      getActualType: () => ({
        status: 400,
        data: {
          status: {
            error: '   ',
          },
        },
      }),
    };

    expect(getErrorMessage(error, { fallbackMessage: 'Something went wrong.' })).toBe('Something went wrong.');
  });

  it('trims a non-empty API error message', () => {
    const error = {
      message: 'Request error:',
      getActualType: () => ({
        status: 400,
        data: {
          status: {
            error: '  Detailed backend message  ',
          },
        },
      }),
    };

    expect(getErrorMessage(error)).toBe('Detailed backend message');
  });
});
