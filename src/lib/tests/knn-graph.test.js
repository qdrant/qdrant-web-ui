/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import { scoresToDistances, resolveDistanceMetric } from '../knn-graph';

describe('scoresToDistances', () => {
  it('converts cosine similarity to distance', () => {
    expect(scoresToDistances([1, 0.5, -1], 'Cosine')).toEqual([0, 0.5, 2]);
  });

  it('shifts dot product scores so the closest pair has distance 0', () => {
    const distances = scoresToDistances([10, 4, -2], 'Dot');
    expect(distances).toEqual([0, 6, 12]);
  });

  it('keeps positive euclidean scores as distances', () => {
    expect(scoresToDistances([0.5, 2, 0], 'Euclid')).toEqual([0.5, 2, 0]);
  });

  it('negates euclidean scores if the server returns them negated', () => {
    expect(scoresToDistances([-0.5, -2, 0], 'Euclid')).toEqual([0.5, 2, -0]);
  });

  it('falls back to shift conversion for unknown metric', () => {
    expect(scoresToDistances([3, 1], null)).toEqual([0, 2]);
  });
});

describe('resolveDistanceMetric', () => {
  it('resolves the metric of the default vector', () => {
    const info = { config: { params: { vectors: { size: 4, distance: 'Cosine' } } } };
    expect(resolveDistanceMetric(info)).toEqual('Cosine');
  });

  it('resolves the metric of a named vector', () => {
    const info = {
      config: {
        params: {
          vectors: {
            image: { size: 4, distance: 'Euclid' },
            text: { size: 8, distance: 'Dot' },
          },
        },
      },
    };
    expect(resolveDistanceMetric(info, 'image')).toEqual('Euclid');
    expect(resolveDistanceMetric(info, 'text')).toEqual('Dot');
  });

  it('returns Dot for sparse vectors', () => {
    const info = {
      config: {
        params: {
          vectors: {},
          sparse_vectors: { keywords: {} },
        },
      },
    };
    expect(resolveDistanceMetric(info, 'keywords')).toEqual('Dot');
  });

  it('returns null when the metric cannot be determined', () => {
    expect(resolveDistanceMetric({}, null)).toBeNull();
    expect(resolveDistanceMetric({ config: { params: { vectors: {} } } }, 'missing')).toBeNull();
  });
});
