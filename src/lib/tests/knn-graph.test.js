/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import { scoresToDistances, densifyKnnGraph, resolveDistanceMetric } from '../knn-graph';

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

describe('densifyKnnGraph', () => {
  const graph = {
    // knn edges: 0 -> 1 (0.9), 1 -> 2 (0.8), 1 -> 0 (0.7)
    offsets_row: [0, 1, 1],
    offsets_col: [1, 2, 0],
    scores: [0.9, 0.8, 0.7],
    ids: ['a', 'b', 'c'],
  };

  it('produces a symmetric matrix with zero diagonal', () => {
    const matrix = densifyKnnGraph(graph, 'Cosine');

    expect(matrix.length).toEqual(3);
    for (let i = 0; i < 3; i++) {
      expect(matrix[i].length).toEqual(3);
      expect(matrix[i][i]).toEqual(0);
      for (let j = 0; j < 3; j++) {
        expect(matrix[i][j]).toEqual(matrix[j][i]);
      }
    }
  });

  it('keeps the smallest distance when both directions are present', () => {
    const matrix = densifyKnnGraph(graph, 'Cosine');

    // cosine distances: 0->1 is 0.1, 1->0 is 0.3, min wins
    expect(matrix[0][1]).toBeCloseTo(0.1);
    expect(matrix[1][0]).toBeCloseTo(0.1);
    expect(matrix[1][2]).toBeCloseTo(0.2);
  });

  it('fills missing pairs with a penalty larger than any observed distance', () => {
    const matrix = densifyKnnGraph(graph, 'Cosine');

    const maxObserved = 0.3; // cosine distance of the 1 -> 0 edge
    expect(matrix[0][2]).toBeGreaterThan(maxObserved);
    expect(matrix[0][2]).toEqual(matrix[2][0]);
  });

  it('squares distances when requested', () => {
    const plain = densifyKnnGraph(graph, 'Cosine');
    const squared = densifyKnnGraph(graph, 'Cosine', { squared: true });

    expect(squared[0][1]).toBeCloseTo(plain[0][1] * plain[0][1]);
    expect(squared[0][2]).toBeCloseTo(plain[0][2] * plain[0][2]);
  });

  it('ignores self-loops', () => {
    const withLoop = {
      offsets_row: [0, 0],
      offsets_col: [0, 1],
      scores: [1, 0.5],
      ids: ['a', 'b'],
    };
    const matrix = densifyKnnGraph(withLoop, 'Cosine');
    expect(matrix[0][0]).toEqual(0);
    expect(matrix[0][1]).toBeCloseTo(0.5);
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
