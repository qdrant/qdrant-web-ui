import { describe, it, expect, afterEach } from 'vitest';
import { compareSemver, formatGroupedDigits, getFullPath, isVersionInRange, parseSemver } from '../common-helpers';

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

describe('parseSemver', () => {
  it('should parse versions with and without a v prefix', () => {
    expect(parseSemver('v1.20.0')).toEqual([1, 20, 0]);
    expect(parseSemver('1.20.3')).toEqual([1, 20, 3]);
  });

  it('should ignore pre-release and build suffixes', () => {
    expect(parseSemver('v1.20.0-rc1')).toEqual([1, 20, 0]);
    expect(parseSemver('1.20.0+build.5')).toEqual([1, 20, 0]);
  });

  it('should return null for non-semver versions', () => {
    expect(parseSemver('dev')).toBeNull();
    expect(parseSemver('1.20')).toBeNull();
    expect(parseSemver(null)).toBeNull();
  });
});

describe('isVersionInRange', () => {
  it('should allow any version when there are no constraints', () => {
    expect(isVersionInRange('1.0.0')).toBe(true);
    expect(isVersionInRange('dev')).toBe(true);
  });

  it('should respect min_version inclusively', () => {
    expect(isVersionInRange('1.20.0', 'v1.20.0')).toBe(true);
    expect(isVersionInRange('1.21.1', 'v1.20.0')).toBe(true);
    expect(isVersionInRange('1.19.9', 'v1.20.0')).toBe(false);
  });

  it('should respect max_version inclusively', () => {
    expect(isVersionInRange('1.20.0', undefined, 'v1.20.0')).toBe(true);
    expect(isVersionInRange('1.20.1', undefined, 'v1.20.0')).toBe(false);
    expect(isVersionInRange('1.16.0', 'v1.15.0', 'v1.20.0')).toBe(true);
  });

  it('should ignore suffixes on the server version', () => {
    expect(isVersionInRange('v1.20.0-rc1', 'v1.20.0')).toBe(true);
    expect(isVersionInRange('1.20.0-rc1', undefined, 'v1.20.0')).toBe(true);
  });

  it('should treat non-semver server versions as the newest version', () => {
    expect(isVersionInRange('dev', 'v1.20.0')).toBe(true);
    expect(isVersionInRange('dev', undefined, 'v1.20.0')).toBe(false);
    expect(isVersionInRange('dev', 'v1.15.0', 'v1.20.0')).toBe(false);
  });
});

describe('formatGroupedDigits', () => {
  it('should group digits with spaces for large integers', () => {
    expect(formatGroupedDigits(1234567)).toBe('1 234 567');
  });

  it('should not add leading separators for small numbers', () => {
    expect(formatGroupedDigits(0)).toBe('0');
    expect(formatGroupedDigits(123)).toBe('123');
    expect(formatGroupedDigits(1234)).toBe('1 234');
  });

  it('should handle negative integers', () => {
    expect(formatGroupedDigits(-1234567)).toBe('-1 234 567');
  });

  it('should return empty string for null and undefined', () => {
    expect(formatGroupedDigits(null)).toBe('');
    expect(formatGroupedDigits(undefined)).toBe('');
  });

  it('should accept numeric strings without Number() coercion', () => {
    expect(formatGroupedDigits('9876543')).toBe('9 876 543');
    expect(formatGroupedDigits('1234.500')).toBe('1 234.500');
    expect(formatGroupedDigits('  1234  ')).toBe('1 234');
    expect(formatGroupedDigits('99999999999999999999')).toBe('99 999 999 999 999 999 999');
  });

  it('should leave scientific-notation strings unchanged', () => {
    expect(formatGroupedDigits('1e3')).toBe('1e3');
    expect(formatGroupedDigits('1E10')).toBe('1E10');
  });

  it('should return non-plain numeric strings unchanged', () => {
    expect(formatGroupedDigits('12a34')).toBe('12a34');
    expect(formatGroupedDigits('1.2.3')).toBe('1.2.3');
    expect(formatGroupedDigits('hello')).toBe('hello');
  });

  it('should return empty string for whitespace-only strings', () => {
    expect(formatGroupedDigits('   ')).toBe('');
  });

  it('should accept bigint', () => {
    expect(formatGroupedDigits(12345678901234567890n)).toBe('12 345 678 901 234 567 890');
    expect(formatGroupedDigits(-99n)).toBe('-99');
  });

  it('should preserve fractional part and group the integer part', () => {
    expect(formatGroupedDigits(12.7)).toBe('12.7');
    expect(formatGroupedDigits(1234567.89)).toBe('1 234 567.89');
    expect(formatGroupedDigits(-1234.5)).toBe('-1 234.5');
  });

  it('should return string value for non-finite numbers', () => {
    expect(formatGroupedDigits(NaN)).toBe('NaN');
    expect(formatGroupedDigits(Infinity)).toBe('Infinity');
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
