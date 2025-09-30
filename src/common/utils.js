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

const uuidRegex =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

export const validateUuid = function (uuid) {
  return typeof uuid === 'string' && uuidRegex.test(uuid);
};

export const formatJSON = function (val = {}, bigIntJSON) {
  try {
    const res = bigIntJSON.parse(val);
    return bigIntJSON.stringify(res, null, 2);
  } catch {
    const errorJson = {
      error: `HERE ${val}`,
    };
    return bigIntJSON.stringify(errorJson, null, 2);
  }
};
