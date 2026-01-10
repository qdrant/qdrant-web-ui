/* eslint-disable no-restricted-globals */
import * as druid from '@saehrimnir/druidjs';
import { createUMAP } from 'embedding-atlas';
import get from 'lodash/get';

const MESSAGE_INTERVAL = 200;
const DEFAULT_ALGORITHM = 'UMAP';

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

self.onmessage = async function (e) {
  let now = new Date().getTime();

  const params = e?.data?.params || {};

  const algorithm = params.algorithm || DEFAULT_ALGORITHM;

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
      error: `cannot perform ${params.algorithm || DEFAULT_ALGORITHM} on single point`,
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
    if (algorithm === 'PCA') {
      const D = new druid[algorithm](data, {});
      const transformedData = D.transform();

      self.postMessage({ result: getDataset(transformedData), error: null });
    } else if (algorithm === 'UMAP') {
      // For detailed implementation see:
      // https://apple.github.io/embedding-atlas/algorithms.html#umap
      const count = points.length;
      const inputDim = data[0].length; // assume all vectors have the same dimension
      const outputDim = 2;

      const flatData = new Float32Array(count * inputDim);
      for (let i = 0; i < count; i++) {
        flatData.set(new Float32Array(data[i]), i * inputDim);
      }

      const umap = await createUMAP(count, inputDim, outputDim, flatData, {
        metric: 'cosine', // do we need to make it configurable?
      });

      for (let i = 0; i < 500; i++) {
        umap.run(i);
        if (Date.now() - now > MESSAGE_INTERVAL) {
          now = Date.now();
          const reducedPoints = [];
          // get embedding once before the loop
          const embedding = umap.embedding;
          for (let j = 0; j < count; j++) {
            reducedPoints.push([embedding[j * outputDim], embedding[j * outputDim + 1]]);
          }
          self.postMessage({ result: getDataset(reducedPoints), error: null });
        }
      }

      // final embedding
      const reducedPoints = [];
      const embedding = umap.embedding;
      for (let j = 0; j < count; j++) {
        reducedPoints.push([embedding[j * outputDim], embedding[j * outputDim + 1]]);
      }

      self.postMessage({ result: getDataset(reducedPoints), error: null });
      umap.destroy();
    } else {
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
  }
};

function getDataset(reducedPoints) {
  // Convert [[x1, y1], [x2, y2] ] to [ { x: x1, y: y1 }, { x: x2, y: y2 } ]
  return reducedPoints.map((point) => ({ x: point[0], y: point[1] }));
}
