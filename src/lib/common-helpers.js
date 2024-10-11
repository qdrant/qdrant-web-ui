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
export const compareSemver = function(version1, version2) {
  const parseVersion = (version) => version.split('.').map(Number);

  const [major1, minor1, patch1] = parseVersion(version1);
  const [major2, minor2, patch2] = parseVersion(version2);

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
}
