/* eslint-disable no-restricted-globals */
import * as druid from '@saehrimnir/druidjs';
import get from 'lodash/get';
import { DEFAULT_N_NEIGHBORS, densifyKnnGraph } from '../../lib/knn-graph';

// druid's TSNE with `metric: "precomputed"` references the bare name `druid`
// inside its own bundle (upstream bug), so the module has to be exposed globally
self.druid = druid;

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

self.onmessage = function (e) {
  const params = e?.data?.params || {};
  const result = e?.data?.result || {};

  try {
    if (result.graph) {
      handleKnnGraph(result, params);
    } else {
      handleRawVectors(result, params);
    }
  } catch (error) {
    self.postMessage({ data: [], error: error?.message ?? String(error) });
  }
};

// Layout from the server-side computed knn graph (distance matrix API),
// no raw vectors involved
function handleKnnGraph(result, params) {
  const algorithm = params.algorithm || DEFAULT_ALGORITHM;
  const graph = result.graph;
  const n = graph.ids.length;

  if (n === 0) {
    self.postMessage({ data: [], error: 'No data found' });
    return;
  }

  if (n < 3) {
    self.postMessage({
      data: [],
      error: `cannot perform ${algorithm} on less than 3 points`,
    });
    return;
  }

  let reducer;
  if (algorithm === 'UMAP') {
    const matrix = densifyKnnGraph(graph, result.metric);
    // Never use more neighbors than the knn graph actually contains per point,
    // otherwise penalty fill values leak into the neighborhoods
    const avgDegree = Math.floor(graph.scores.length / n);
    const nNeighbors = Math.max(2, Math.min(params.n_neighbors ?? DEFAULT_N_NEIGHBORS, avgDegree, n - 1));
    reducer = new druid.UMAP(matrix, { metric: 'precomputed', n_neighbors: nNeighbors });
  } else if (algorithm === 'TSNE') {
    // druid's TSNE defaults to squared euclidean, mirror that for precomputed distances
    const matrix = densifyKnnGraph(graph, result.metric, { squared: true });
    const perplexity = Math.max(2, Math.min(50, Math.floor((n - 1) / 3)));
    reducer = new druid.TSNE(matrix, { metric: 'precomputed', perplexity });
  } else {
    self.postMessage({
      data: [],
      error: `${algorithm} does not support server-side distance matrix`,
    });
    return;
  }

  streamLayout(reducer);
}

// Legacy path: dimensionality reduction on raw vectors, loaded into the browser.
// Used for PCA and as a fallback for Qdrant versions without the matrix API.
function handleRawVectors(result, params) {
  const algorithm = params.algorithm || DEFAULT_ALGORITHM;

  const data = [];

  const points = result.points;
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
      error: `cannot perform ${algorithm} on single point`,
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
    } else {
      const D = new druid[algorithm](data, {}); // ex  params = { perplexity : 50,epsilon :5}
      streamLayout(D);
    }
  }
}

// Run the iterative layout, streaming intermediate results for animation
function streamLayout(reducer) {
  let now = Date.now();
  const next = reducer.generator(); // default = 500 iterations

  let reducedPoints = [];
  for (reducedPoints of next) {
    if (Date.now() - now > MESSAGE_INTERVAL) {
      now = Date.now();
      self.postMessage({ result: getDataset(reducedPoints), error: null });
    }
  }
  self.postMessage({ result: getDataset(reducedPoints), error: null });
}

function getDataset(reducedPoints) {
  // Convert [[x1, y1], [x2, y2] ] to [ { x: x1, y: y1 }, { x: x2, y: y2 } ]
  return reducedPoints.map((point) => ({ x: point[0], y: point[1] }));
}
