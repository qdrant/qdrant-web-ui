import { describe, it, expect } from 'vitest';
import { computeVectorFingerprint } from '../vector-fingerprint';

const distance = (a, b) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
};

const matchingSigns = (a, b) => {
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    if (Math.sign(a[i]) === Math.sign(b[i])) {
      matches++;
    }
  }
  return matches / a.length;
};

// deterministic pseudo-random generator for test vectors
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randomVector = (dim, seed) => {
  const rand = mulberry32(seed);
  return Array.from({ length: dim }, () => rand() * 2 - 1);
};

describe('computeVectorFingerprint', () => {
  it('is deterministic', () => {
    const vector = randomVector(512, 1);
    const a = computeVectorFingerprint(vector, 32);
    const b = computeVectorFingerprint(vector, 32);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('keeps values in [-1, 1] and is scale-invariant', () => {
    const vector = randomVector(3000, 2);
    const fingerprint = computeVectorFingerprint(vector, 32);
    expect(fingerprint.length).toBe(32);
    for (const value of fingerprint) {
      expect(Math.abs(value)).toBeLessThanOrEqual(1);
    }
    const scaled = computeVectorFingerprint(
      vector.map((v) => v * 100),
      32
    );
    for (let i = 0; i < fingerprint.length; i++) {
      expect(scaled[i]).toBeCloseTo(fingerprint[i], 5);
    }
  });

  it('produces closer fingerprints for closer vectors', () => {
    const base = randomVector(512, 3);
    const near = base.map((value, i) => value + 0.1 * (i % 2 ? 1 : -1));
    const far = randomVector(512, 4);

    const fpBase = computeVectorFingerprint(base, 32);
    const fpNear = computeVectorFingerprint(near, 32);
    const fpFar = computeVectorFingerprint(far, 32);

    expect(distance(fpBase, fpNear)).toBeLessThan(distance(fpBase, fpFar));
  });

  it('keeps most cell signs stable between similar vectors', () => {
    const base = randomVector(1024, 5);
    const rand = mulberry32(6);
    // small perturbation: cosine similarity stays high
    const near = base.map((value) => value + (rand() * 2 - 1) * 0.15);

    const fpBase = computeVectorFingerprint(base, 32);
    const fpNear = computeVectorFingerprint(near, 32);
    expect(matchingSigns(fpBase, fpNear)).toBeGreaterThan(0.8);
  });

  it('supports sparse vectors', () => {
    const sparse = { indices: [1, 100, 100000, 4294967295], values: [0.5, -1, 2, 0.1] };
    const fingerprint = computeVectorFingerprint(sparse, 32);
    expect(fingerprint.length).toBe(32);
    expect(fingerprint.some((value) => value !== 0)).toBe(true);
  });

  it('supports multivectors', () => {
    const multivector = [randomVector(128, 7), randomVector(128, 8)];
    const fingerprint = computeVectorFingerprint(multivector, 32);
    expect(fingerprint.length).toBe(32);
    expect(fingerprint.some((value) => value !== 0)).toBe(true);
  });

  it('clamps bucket count to the vector dimension and to 32', () => {
    expect(computeVectorFingerprint([1, -2, 3], 48).length).toBe(3);
    expect(computeVectorFingerprint(randomVector(512, 9), 64).length).toBe(32);
  });

  it('returns null for unsupported shapes', () => {
    expect(computeVectorFingerprint(null)).toBeNull();
    expect(computeVectorFingerprint([])).toBeNull();
    expect(computeVectorFingerprint({ text: 'inference object' })).toBeNull();
    expect(computeVectorFingerprint({ indices: [], values: [] })).toBeNull();
  });
});
