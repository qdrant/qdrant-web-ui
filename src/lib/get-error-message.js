// Status and body of a failed response, for errors of the Qdrant client (ApiError) and of axios.
// Returns null for other errors.
const getErrorResponse = (e) => {
  if (e?.isAxiosError) {
    return e.response ? { status: e.response.status, data: e.response.data } : null;
  }
  try {
    // error is instance of ApiError
    const { status, data } = e.getActualType();
    return { status, data };
  } catch {
    // error is not instance of ApiError
    return null;
  }
};

/**
 * Get error message from error object
 * @param {Error} e - error object
 * @param {?Object} [options] - options: {defaultMessage: string, withApiKey: {apiKey: string}}
 * @param {?string} [options.fallbackMessage] - fallback error message
 * @param {?Object} [options.withApiKey] - object with apiKey
 * @param {?string} [options.withApiKey.apiKey] - apiKey
 * @return {null|string}
 */
export const getErrorMessage = (e, options = {}) => {
  const { fallbackMessage = 'Something went wrong.', withApiKey = null } = options;
  const { apiKey } = withApiKey || {};

  const response = getErrorResponse(e);
  if (!response) {
    return e?.message || fallbackMessage;
  }

  if ((response.status === 401 || response.status === 403) && withApiKey) {
    if (!apiKey) {
      return null;
    } else {
      return 'Your API key is invalid. Please, set a new one.';
    }
  }
  // Qdrant errors are JSON with the message in `status.error`, auth errors are plain text.
  const text = typeof response.data === 'string' ? response.data.trim() : '';
  return response.data?.status?.error || text || e.message || fallbackMessage;
};
