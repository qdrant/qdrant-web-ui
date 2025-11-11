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
