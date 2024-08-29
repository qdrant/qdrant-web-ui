import { describe, it, expect } from 'vitest';
import { getMinimalSpanningTree } from '../graph-visualization-helpers';

describe('getMinimalSpanningTree', () => {
  it('should return the minimal spanning tree for a given set of links (ascending order)', () => {
    const links = [
      { source: 'A', target: 'B', score: 1 },
      { source: 'B', target: 'C', score: 2 },
      { source: 'A', target: 'C', score: 3 },
      { source: 'C', target: 'D', score: 4 },
      { source: 'B', target: 'D', score: 5 },
    ];

    const expectedMST = [
      { source: 'B', target: 'D', score: 5 },
      { source: 'C', target: 'D', score: 4 },
      { source: 'A', target: 'C', score: 3 },
    ];

    const result = getMinimalSpanningTree(links, true);
    expect(result).toEqual(expectedMST);
  });

  it('should return the minimal spanning tree for a given set of links (descending order)', () => {
    const links = [
      { source: 'A', target: 'B', score: 1 },
      { source: 'B', target: 'C', score: 2 },
      { source: 'A', target: 'C', score: 3 },
      { source: 'C', target: 'D', score: 4 },
      { source: 'B', target: 'D', score: 5 },
    ];

    const expectedMST = [
      { source: 'A', target: 'B', score: 1 },
      { source: 'B', target: 'C', score: 2 },
      { source: 'C', target: 'D', score: 4 },
    ];

    const result = getMinimalSpanningTree(links, false);
    expect(result).toEqual(expectedMST);
  });

  it('should return an empty array if no links are provided', () => {
    const links = [];
    const expectedMST = [];
    const result = getMinimalSpanningTree(links, true);
    expect(result).toEqual(expectedMST);
  });

  it('should handle a single link correctly', () => {
    const links = [{ source: 'A', target: 'B', score: 1 }];
    const expectedMST = [{ source: 'A', target: 'B', score: 1 }];
    const result = getMinimalSpanningTree(links, true);
    expect(result).toEqual(expectedMST);
  });
});
