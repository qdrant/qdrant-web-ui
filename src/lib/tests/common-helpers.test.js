import { describe, it, expect } from 'vitest';
import { compareSemver } from '../common-helpers';

describe('compareSemver', () => {
  it('should return 0 if the versions are equal', () => {
    const version1 = '1.0.0';
    const version2 = '1.0.0';
    const result = compareSemver(version1, version2);
    expect(result).toEqual(0);
  });

  it('should return 1 if version1 is greater', () => {
    const version1 = '1.0.1';
    const version2 = '1.0.0';
    const result = compareSemver(version1, version2);
    expect(result).toEqual(1);
  });

  it('should return -1 if version2 is greater', () => {
    const version1 = '1.0.0';
    const version2 = '1.0.1';
    const result = compareSemver(version1, version2);
    expect(result).toEqual(-1);
  });
});
