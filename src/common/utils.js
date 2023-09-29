export const getBaseURL = function () {
  const url = new URL(window.location.href);
  const pathname = url.pathname.replace(/dashboard$/, '');
  return new URL(pathname, url.href).href;
};

export const pumpFile = function (reader, callback, chunks = []) {
  return reader.read().then(({ done, value }) => {
    if (done) {
      return chunks;
    }
    callback(value.length);
    chunks.push(value);
    return pumpFile(reader, callback, chunks);
  });
};

export const updateProgress = function (snapshotSize, callback) {
  let loaded = 0;

  return (chunkSize) => {
    loaded += chunkSize;

    const total = snapshotSize ? parseInt(snapshotSize, 10) : null;
    const newProgress = Math.round((loaded / total) * 100);
    callback(newProgress);
  };
};
