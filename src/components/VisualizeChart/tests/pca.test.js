import { describe, it, expect } from 'vitest';
import { pca2d } from '../pca';

describe('pca2d', () => {
  it('projects onto the directions of maximal variance', () => {
    // Points on a diagonal line in 3D with small orthogonal noise:
    // the first component must capture the diagonal
    const points = [];
    for (let i = 0; i < 50; i++) {
      const t = i - 25;
      points.push([t, t, t + Math.sin(i * 7.3) * 0.01]);
    }
    const projected = pca2d(points);

    // Order along the first component matches order along the line
    // (up to a global sign)
    const xs = [];
    for (let i = 0; i < 50; i++) {
      xs.push(projected[i * 2]);
    }
    const increasing = xs.every((x, i) => i === 0 || x > xs[i - 1]);
    const decreasing = xs.every((x, i) => i === 0 || x < xs[i - 1]);
    expect(increasing || decreasing).toBe(true);

    // Second component only carries the noise
    const spreadY =
      Math.max(...xs.map((_, i) => projected[i * 2 + 1])) - Math.min(...xs.map((_, i) => projected[i * 2 + 1]));
    const spreadX = Math.max(...xs) - Math.min(...xs);
    expect(spreadY).toBeLessThan(spreadX / 10);
  });

  it('separates two clusters along the first component', () => {
    const points = [];
    for (let i = 0; i < 40; i++) {
      const offset = i < 20 ? 0 : 8;
      points.push([offset + Math.sin(i) * 0.3, offset + Math.cos(i) * 0.3, Math.sin(i * 2) * 0.3]);
    }
    const projected = pca2d(points);
    const a = projected.filter((_, idx) => idx % 2 === 0).slice(0, 20);
    const b = projected.filter((_, idx) => idx % 2 === 0).slice(20);
    const meanA = a.reduce((s, v) => s + v, 0) / a.length;
    const meanB = b.reduce((s, v) => s + v, 0) / b.length;
    expect(Math.abs(meanA - meanB)).toBeGreaterThan(5);
  });

  it('is deterministic', () => {
    const points = Array.from({ length: 30 }, (_, i) => [Math.sin(i * 1.7), Math.cos(i * 0.9), Math.sin(i * 2.3)]);
    expect(pca2d(points)).toEqual(pca2d(points));
  });
});
