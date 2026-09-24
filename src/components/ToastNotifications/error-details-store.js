// Snackbars are rendered by notistack outside of the app theme, so the details dialog lives in the app
// and the snackbar hands the message over through this tiny store.
let currentMessage = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const showErrorDetails = (message) => {
  currentMessage = message;
  emit();
};

export const hideErrorDetails = () => {
  currentMessage = null;
  emit();
};

export const subscribeToErrorDetails = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getErrorDetails = () => currentMessage;
