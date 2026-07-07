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
