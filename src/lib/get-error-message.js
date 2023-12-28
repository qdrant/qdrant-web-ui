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
  const {
    fallbackMessage = "Something went wrong.",
    withApiKey = null,
  } = options;
  const { apiKey } = withApiKey || {};
  let message;

  try {
    // error is instance of ApiError
    const error = e.getActualType();
    if ((error.status === 401 || error.status === 403) && withApiKey) {
      if (!apiKey) {
        return null;
      } else {
        return "Your API key is invalid. Please, set a new one.";
      }
    }
    message = error.data?.status?.error || e.message || fallbackMessage;
  } catch (err) {
    // error is not instance of ApiError
    message = e.message || fallbackMessage;
  }
  return message;
};
