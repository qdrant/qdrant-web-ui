/* eslint-disable no-restricted-globals */
import get from 'lodash/get';
import initWasm, { UmapLayout, TsneLayout, TsneParams } from '@qdrant/graph-layout-wasm';
import wasmUrl from '@qdrant/graph-layout-wasm/pkg/graph_layout_wasm_bg.wasm?url';
import { scoresToDistances } from '../../lib/knn-graph';
import { pca2d } from './pca';

let wasmReady = null;
function ensureWasm() {
  wasmReady = wasmReady ?? initWasm({ module_or_path: wasmUrl });
  return wasmReady;
}

const MESSAGE_INTERVAL = 200;
const UMAP_EPOCHS_PER_CHUNK = 5;
const TSNE_ITERATIONS_PER_CHUNK = 10;
const DEFAULT_ALGORITHM = 'UMAP';

self.onmessage = async function (e) {
  const params = e?.data?.params || {};
  const result = e?.data?.result || {};

  try {
    if (result.graph) {
      await handleKnnGraph(result, params);
    } else if ((params.algorithm || DEFAULT_ALGORITHM) === 'PCA') {
      handlePca(result, params);
    } else {
      self.postMessage({ data: [], error: 'No data found' });
    }
  } catch (error) {
    self.postMessage({ data: [], error: error?.message ?? String(error) });
  }
};

// Layout from the server-side computed knn graph (distance matrix API),
// no raw vectors involved
async function handleKnnGraph(result, params) {
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

  await ensureWasm();

  const rows = new Uint32Array(graph.offsets_row);
  const cols = new Uint32Array(graph.offsets_col);
  const distances = new Float32Array(scoresToDistances(graph.scores, result.metric));

  let layout;
  let chunk;
  if (algorithm === 'UMAP') {
    // default params: min_dist 0.1, auto epochs, fixed seed
    layout = new UmapLayout(n, rows, cols, distances, undefined);
    chunk = UMAP_EPOCHS_PER_CHUNK;
  } else if (algorithm === 'TSNE') {
    const tsneParams = new TsneParams();
    // The graph carries the neighbors the server was asked for; without an
    // explicit perplexity, derive one from the actual graph degree
    // (t-SNE convention: k = 3 x perplexity)
    const avgDegree = Math.floor(graph.scores.length / n);
    tsneParams.perplexity = params.perplexity ?? Math.min(30, Math.max(2, Math.floor(avgDegree / 3)));
    layout = new TsneLayout(n, rows, cols, distances, tsneParams);
    chunk = TSNE_ITERATIONS_PER_CHUNK;
  } else {
    self.postMessage({
      data: [],
      error: `${algorithm} does not support server-side distance matrix`,
    });
    return;
  }

  try {
    let now = Date.now();
    let done = false;
    while (!done) {
      done = layout.step(chunk);
      if (Date.now() - now > MESSAGE_INTERVAL) {
        now = Date.now();
        postPositions(layout.embedding(), {
          step: layout.current_epoch(),
          total: layout.n_epochs(),
        });
      }
    }
    postPositions(layout.embedding(), null, true);
  } finally {
    layout.free();
  }
}

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

// PCA fundamentally needs the raw vectors (there is nothing to precompute
// server-side), so it is the one algorithm still fed by a scroll request
function handlePca(result, params) {
  const points = result.points;
  const vectorName = params.using;

  if (!points || points.length === 0) {
    self.postMessage({ data: [], error: 'No data found' });
    return;
  }

  if (points.length === 1) {
    self.postMessage({ data: [], error: 'cannot perform PCA on single point' });
    return;
  }

  const data = [];
  for (let i = 0; i < points.length; i++) {
    if (!vectorName) {
      // Work with default vector
      data.push(points[i]?.vector);
    } else {
      // Work with named vector
      data.push(get(points[i]?.vector, vectorName));
    }
  }

  for (let i = 0; i < data.length; i++) {
    const vectorType = getVectorType(data[i]);
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

  postPositions(pca2d(data), null, true);
}

// Send flat [x0, y0, x1, y1, ...] coordinates, transferring the buffer.
// `progress` is { step, total }, `done` marks the final frame of the layout.
function postPositions(positions, progress = null, done = false) {
  const array = positions instanceof Float32Array ? positions : new Float32Array(positions);
  self.postMessage({ result: array, progress, done, error: null }, [array.buffer]);
}
