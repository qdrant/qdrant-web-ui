// Principal component analysis, used by the visualization worker for the
// 'PCA' algorithm - the one path that still consumes raw vectors.

// Deterministic PRNG for reproducible PCA sign/orientation
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Project onto the top-2 principal components via power iteration on the
// centered data. Never forms the covariance matrix: each iteration is
// w = X_c^T (X_c v), O(n * d)
export function pca2d(vectors) {
  const n = vectors.length;
  const d = vectors[0].length;

  const mean = new Float64Array(d);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      mean[j] += vectors[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    mean[j] /= n;
  }

  const rand = mulberry32(42);
  const components = [];

  for (let c = 0; c < 2; c++) {
    let v = new Float64Array(d);
    for (let j = 0; j < d; j++) {
      v[j] = rand() - 0.5;
    }
    orthonormalize(v, components);

    for (let iter = 0; iter < 64; iter++) {
      const w = new Float64Array(d);
      for (let i = 0; i < n; i++) {
        const row = vectors[i];
        let dot = 0;
        for (let j = 0; j < d; j++) {
          dot += (row[j] - mean[j]) * v[j];
        }
        for (let j = 0; j < d; j++) {
          w[j] += (row[j] - mean[j]) * dot;
        }
      }
      orthonormalize(w, components);

      let agreement = 0;
      for (let j = 0; j < d; j++) {
        agreement += w[j] * v[j];
      }
      v = w;
      if (Math.abs(1 - Math.abs(agreement)) < 1e-9) {
        break;
      }
    }
    components.push(v);
  }

  const positions = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const row = vectors[i];
    for (let c = 0; c < 2; c++) {
      let dot = 0;
      for (let j = 0; j < d; j++) {
        dot += (row[j] - mean[j]) * components[c][j];
      }
      positions[i * 2 + c] = dot;
    }
  }
  return positions;
}

// Remove projections onto previous components, then normalize
function orthonormalize(v, components) {
  const d = v.length;
  for (const component of components) {
    let dot = 0;
    for (let j = 0; j < d; j++) {
      dot += v[j] * component[j];
    }
    for (let j = 0; j < d; j++) {
      v[j] -= dot * component[j];
    }
  }
  let norm = 0;
  for (let j = 0; j < d; j++) {
    norm += v[j] * v[j];
  }
  norm = Math.sqrt(norm) || 1;
  for (let j = 0; j < d; j++) {
    v[j] /= norm;
  }
}
