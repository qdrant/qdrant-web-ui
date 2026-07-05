/* eslint-disable camelcase */

// Helpers for consuming the Qdrant Distance Matrix API (points/search/matrix/offsets)
// and converting its sparse knn graph into inputs for dimensionality reduction.

export const DEFAULT_N_NEIGHBORS = 15;

function arrayMax(values) {
  // Math.max(...values) overflows the call stack for large arrays
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
  }
  return max;
}

// Convert raw similarity scores of the collection metric into distances
// (non-negative, lower = closer). Only relative order and magnitude matter
// for the layout, so shift-based conversions are acceptable.
export function scoresToDistances(scores, metric) {
  switch (metric) {
    case 'Euclid':
    case 'Manhattan': {
      // Scores are already distances; guard against a negated-distance convention
      const maxScore = arrayMax(scores);
      return maxScore <= 0 ? scores.map((s) => -s) : [...scores];
    }
    case 'Cosine':
      return scores.map((s) => 1 - s);
    case 'Dot':
    default: {
      // Unbounded similarity (or unknown metric): shift so the closest pair has distance 0
      const maxScore = arrayMax(scores);
      return scores.map((s) => maxScore - s);
    }
  }
}

// Expand the sparse knn graph from the matrix/offsets response into a dense,
// symmetric distance matrix (as an array of rows), suitable for DruidJS
// with `metric: "precomputed"`. Pairs absent from the knn graph get a penalty
// distance larger than any observed one.
//
// Note: this densification is O(n²) memory and is a temporary bridge until
// the layout can consume the sparse graph directly.
export function densifyKnnGraph(graph, metric, { squared = false } = {}) {
  const { offsets_row, offsets_col, scores, ids } = graph;
  const n = ids.length;

  const distances = scoresToDistances(scores, metric);

  const maxDistance = distances.length > 0 ? arrayMax(distances) : 0;
  let fillValue = (maxDistance > 0 ? maxDistance : 1) * 2;
  if (squared) {
    fillValue *= fillValue;
  }

  const matrix = new Array(n);
  for (let i = 0; i < n; i++) {
    matrix[i] = new Array(n).fill(fillValue);
    matrix[i][i] = 0;
  }

  for (let k = 0; k < distances.length; k++) {
    const i = offsets_row[k];
    const j = offsets_col[k];
    if (i === j) {
      continue;
    }
    const distance = squared ? distances[k] * distances[k] : distances[k];
    // Symmetrize, keeping the smaller distance if both directions are present
    if (distance < matrix[i][j]) {
      matrix[i][j] = distance;
      matrix[j][i] = distance;
    }
  }

  return matrix;
}

// Figure out the distance metric of the vector used for visualization
// from the collection info. Returns null if it cannot be determined.
export function resolveDistanceMetric(collectionInfo, using = null) {
  const params = collectionInfo?.config?.params;
  if (!params) {
    return null;
  }

  if (using) {
    if (params.sparse_vectors && using in params.sparse_vectors) {
      // Sparse vectors are always scored with dot product
      return 'Dot';
    }
    return params.vectors?.[using]?.distance ?? null;
  }

  // Default (unnamed) vector
  return params.vectors?.distance ?? null;
}
