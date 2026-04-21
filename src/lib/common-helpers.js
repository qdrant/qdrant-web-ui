export const resizeObserverWithCallback = (callback) => {
  return new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { target } = entry;
      const { width, height } = target.getBoundingClientRect();
      if (typeof callback === 'function') callback(width, height);
    }
  });
};

/**
 * Compare two semver strings.
 * @param {string} version1 - The first version string.
 * @param {string} version2 - The second version string.
 * @return {number} - Returns 0 if the versions are equal, 1 if version1 is greater, and -1 if version2 is greater.
 */
export const compareSemver = function (version1, version2) {
  const parseVersion = (version) =>
    version.split('.').map((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });

  const [major1 = 0, minor1 = 0, patch1 = 0] = parseVersion(version1);
  const [major2 = 0, minor2 = 0, patch2 = 0] = parseVersion(version2);

  if (major1 !== major2) {
    return major1 > major2 ? 1 : -1;
  }
  if (minor1 !== minor2) {
    return minor1 > minor2 ? 1 : -1;
  }
  if (patch1 !== patch2) {
    return patch1 > patch2 ? 1 : -1;
  }
  return 0;
};

const sanitizeSemver = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const parts = value
    .toString()
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((segment) => {
      const parsed = Number.parseInt(segment, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });

  if (parts.length === 0) {
    return null;
  }

  return parts.join('.');
};

export const isSemverGreater = (nextVersion, currentVersion) => {
  const normalizedNext = sanitizeSemver(nextVersion);
  const normalizedCurrent = sanitizeSemver(currentVersion);

  if (!normalizedNext || !normalizedCurrent) {
    return false;
  }

  return compareSemver(normalizedNext, normalizedCurrent) === 1;
};

export const buildReleaseLink = (version) => {
  const normalized = sanitizeSemver(version);

  if (!normalized) {
    return null;
  }

  return `https://github.com/qdrant/qdrant/releases/tag/v${normalized}`;
};

/**
 * Builds a full path to a file, taking into account the base URL.
 * @param {string} filePath - The file path (e.g., '/data/info.json' or 'logo.svg').
 * @return {string} - The full path with the base URL prepended.
 */
export const getFullPath = (filePath) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.replace(/\/?$/, '/');
  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Turn PascalCase or camelCase into a lowercase phrase with spaces between words.
 * @param {string} value - Identifier-style string (e.g. Active, ReshardingScaleDown).
 * @return {string} Phrase (e.g. "active", "resharding scale down").
 */
export const humanizePascalCase = (value) => {
  return value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();
};

const SCIENTIFIC_NOTATION_STRING = /^[-+]?(\d+\.?\d*|\.\d+)[eE][+-]?\d+$/;

/**
 * Group a trimmed plain decimal string (no exponent). Invalid shapes return `trim` unchanged.
 * Example: `1234567.500` -> `1 234 567.500`.
 * @param {string} trim
 * @return {string}
 */
const formatPlainNumericString = (trim) => {
  const match = trim.match(/^([+-]?)(\d*)(?:\.(\d*))?$/);
  if (!match) return trim;

  const [, sign, intRaw, frac] = match;
  if (intRaw === '' && !frac) return trim; // lone sign, lone dot, or empty

  const intPart = intRaw || '0'; // handle '.5' -> '0.5'
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const body = frac !== undefined ? `${grouped}.${frac}` : grouped;
  return sign ? `${sign}${body}` : body;
};

/**
 * Group digits with spaces every three places in the integer part (e.g. 1234567 -> "1 234 567").
 * For numbers, fractional digits follow `Number` stringification. String inputs are grouped on the
 * literal integer digits (no `Number()`), so large integers and trailing fractional zeros are preserved;
 * strings in scientific notation (e.g. `1e3`) are returned unchanged.
 * @param {number|string|bigint|null|undefined} value
 * @return {string}
 */
export const formatGroupedDigits = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return '';
    if (SCIENTIFIC_NOTATION_STRING.test(trimmed)) return trimmed;
    return formatPlainNumericString(trimmed);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    const raw = String(value);
    if (raw.includes('e') || raw.includes('E')) return raw;
    return formatPlainNumericString(raw);
  }
  if (typeof value === 'bigint') {
    return formatPlainNumericString(String(value));
  }
  return String(value);
};
