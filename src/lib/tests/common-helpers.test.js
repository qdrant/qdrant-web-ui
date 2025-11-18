import { describe, it, expect, afterEach } from 'vitest';
import { compareSemver, getFullPath } from '../common-helpers';

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

describe('getFullPath', () => {
  const originalBaseUrl = import.meta.env.BASE_URL;

  afterEach(() => {
    import.meta.env.BASE_URL = originalBaseUrl;
  });

  it('should handle path without leading slash with root base URL', () => {
    import.meta.env.BASE_URL = '/';
    expect(getFullPath('logo.svg')).toBe('/logo.svg');
  });

  it('should handle path with leading slash with root base URL', () => {
    import.meta.env.BASE_URL = '/';
    expect(getFullPath('/logo.svg')).toBe('/logo.svg');
  });

  it('should handle path without leading slash with subpath base URL', () => {
    import.meta.env.BASE_URL = '/dashboard';
    expect(getFullPath('logo.svg')).toBe('/dashboard/logo.svg');
  });

  it('should handle path with leading slash with subpath base URL', () => {
    import.meta.env.BASE_URL = '/dashboard';
    expect(getFullPath('/logo.svg')).toBe('/dashboard/logo.svg');
  });

  it('should handle base URL with trailing slash', () => {
    import.meta.env.BASE_URL = '/dashboard/';
    expect(getFullPath('logo.svg')).toBe('/dashboard/logo.svg');
  });
});
