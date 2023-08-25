export const pumpFile = function(reader, callback, chunks = []) {

  return reader.read().then(({ done, value }) => {
    if (done) {
      return chunks;
    }
    callback(value);
    chunks.push(value);
    return pumpFile(reader, callback, chunks);
  });
}

export const updateProgress = function(snapshotSize, callback) {
  let loaded = 0;

  return (value) => {

    loaded += value.length;

    const total = snapshotSize ? parseInt(snapshotSize, 10) : null;
    const newProgress = Math.round((loaded / total) * 100);
    callback(newProgress);
  };
}
