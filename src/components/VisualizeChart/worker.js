/* eslint-disable no-restricted-globals */
import * as druid from '@saehrimnir/druidjs';
import get from 'lodash/get';

const MESSAGE_INTERVAL = 200;

function getVectorType(vector) {
  if (Array.isArray(vector)) {
    if (Array.isArray(vector[0])) {
      return 'multivector';
    }
    return 'vector';
  }
  if (typeof vector === 'object') {
    if (vector.indices) {
      return 'sparse';
    }
    return 'named';
  }
  return 'unknown';
}

self.onmessage = function (e) {
  let now = new Date().getTime();

  const params = e?.data?.params || {};

  const algorithm = params.algorithm || 'TSNE';

  const data = [];

  const points = e.data?.result?.points;
  const vectorName = params.using;

  if (!points || points.length === 0) {
    self.postMessage({
      data: [],
      error: 'No data found',
    });
    return;
  }

  if (points.length === 1) {
    self.postMessage({
      data: [],
      error: `cannot perform ${params.algorithm || 'TSNE'} on single point`,
    });
    return;
  }

  for (let i = 0; i < points.length; i++) {
    if (!vectorName) {
      // Work with default vector
      data.push(points[i]?.vector);
    } else {
      // Work with named vector
      data.push(get(points[i]?.vector, vectorName));
    }
  }

  // Validate data

  for (let i = 0; i < data.length; i++) {
    const vector = data[i];
    const vectorType = getVectorType(vector);

    if (vectorType === 'vector') {
      continue;
    }

    if (vectorType === 'named') {
      self.postMessage({
        data: [],
        error: 'Please select a valid vector name (by `using`), default vector is not defined',
      });
      return;
    }

    self.postMessage({
      data: [],
      error: 'Vector visualization is not supported for vector type: ' + vectorType,
    });
    return;
  }

  if (data.length) {
    const D = new druid[algorithm](data, {}); // ex  params = { perplexity : 50,epsilon :5}
    const next = D.generator(); // default = 500 iterations

    let reducedPoints = [];
    for (reducedPoints of next) {
      if (Date.now() - now > MESSAGE_INTERVAL) {
        now = Date.now();
        self.postMessage({ result: getDataset(reducedPoints), error: null });
      }
    }
    self.postMessage({ result: getDataset(reducedPoints), error: null });
  }
};

function getDataset(reducedPoints) {
  // Convert [[x1, y1], [x2, y2] ] to [ { x: x1, y: y1 }, { x: x2, y: y2 } ]
  return reducedPoints.map((point) => ({ x: point[0], y: point[1] }));
}
