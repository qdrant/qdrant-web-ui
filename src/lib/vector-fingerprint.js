/**
 * Deterministic 32-bit integer hash (murmur3 finalizer).
 * Its bits are used as pseudo-random projection signs, so each dimension
 * contributes a stable +/-1 to every fingerprint cell.
 * @param {number} i - input integer
 * @return {number} - unsigned 32-bit hash
 */
const hashInt = (i) => {
  let h = i | 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};

// one projection sign per hash bit
const MAX_BUCKETS = 32;

// A random +/-1 projection of a unit vector is roughly a standard normal,
// so +/-2.5 sigma covers nearly the whole range after normalization.
const DISPLAY_SIGMA = 2.5;

const accumulateDense = (vector, buckets, offset) => {
  for (let i = 0; i < vector.length; i++) {
    const value = vector[i];
    const bits = hashInt(i + offset);
    for (let j = 0; j < buckets.length; j++) {
      buckets[j] += (bits >>> j) & 1 ? value : -value;
    }
  }
};

const accumulateSparse = (indices, values, buckets) => {
  for (let i = 0; i < indices.length; i++) {
    const value = values[i];
    const bits = hashInt(Number(indices[i]));
    for (let j = 0; j < buckets.length; j++) {
      buckets[j] += (bits >>> j) & 1 ? value : -value;
    }
  }
};

const squaredNorm = (values) => {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * values[i];
  }
  return sum;
};

/**
 * Reduce a vector of any supported shape (dense, multivector, sparse)
 * to a fixed-size signed fingerprint with values in [-1, 1].
 *
 * Each cell is a SimHash-style projection of the whole vector onto a
 * deterministic random +/-1 direction, normalized by the vector's L2 norm.
 * Cell signs stay stable between similar vectors (for cosine similarity s
 * a fraction 1 - acos(s)/pi of signs agree), so close vectors produce
 * visually close fingerprints while unrelated ones agree only by chance.
 *
 * @param {Array<number>|Array<Array<number>>|{indices: Array<number>, values: Array<number>}} vector
 * @param {number} numBuckets - number of fingerprint cells (capped at 32)
 * @return {Float32Array|null} - fingerprint values in [-1, 1], or null if the shape is not supported
 */
export const computeVectorFingerprint = (vector, numBuckets = MAX_BUCKETS) => {
  if (!vector) {
    return null;
  }

  let size = Math.max(1, Math.min(numBuckets, MAX_BUCKETS));
  let norm2 = 0;
  if (Array.isArray(vector)) {
    const dim = Array.isArray(vector[0]) ? vector[0].length : vector.length;
    size = Math.min(size, dim);
  }
  const buckets = new Float32Array(size);

  if (Array.isArray(vector)) {
    if (vector.length === 0) {
      return null;
    }
    if (Array.isArray(vector[0])) {
      // multivector: project each row with a row-specific sign pattern,
      // so rows do not cancel each other out
      for (let row = 0; row < vector.length; row++) {
        if (Array.isArray(vector[row])) {
          accumulateDense(vector[row], buckets, Math.imul(row, 0x9e3779b9));
          norm2 += squaredNorm(vector[row]);
        }
      }
    } else if (typeof vector[0] === 'number') {
      accumulateDense(vector, buckets, 0);
      norm2 = squaredNorm(vector);
    } else {
      return null;
    }
  } else if (Array.isArray(vector.indices) && Array.isArray(vector.values)) {
    if (vector.indices.length === 0) {
      return null;
    }
    accumulateSparse(vector.indices, vector.values, buckets);
    norm2 = squaredNorm(vector.values);
  } else {
    return null;
  }

  if (norm2 === 0) {
    return buckets;
  }

  const scale = 1 / (Math.sqrt(norm2) * DISPLAY_SIGMA);
  for (let j = 0; j < buckets.length; j++) {
    const value = buckets[j] * scale;
    buckets[j] = Math.max(-1, Math.min(1, value));
  }

  return buckets;
};
