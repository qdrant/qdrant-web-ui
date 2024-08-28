export const resizeObserverWithCallback = (callback) => {
  return new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { target } = entry;
      const { width, height } = target.getBoundingClientRect();
      if (typeof callback === 'function') callback(width, height);
    }
  });
};
