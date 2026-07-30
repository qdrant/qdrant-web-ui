/**
 * Build a WeakMap from every object/array reference in a JSON tree to its
 * path (array of keys). Used to recover the full path inside render callbacks
 * that only provide parentValue + keyName.
 *
 * @param {Object} obj - root JSON object to walk
 * @return {WeakMap} map from object references to their paths
 */
export function buildPathMap(obj) {
  const map = new WeakMap();
  function walk(val, path) {
    if (val !== null && typeof val === 'object') {
      if (!map.has(val)) {
        map.set(val, path);
      }
      if (Array.isArray(val)) {
        val.forEach((item, i) => walk(item, [...path, i]));
      } else {
        Object.entries(val).forEach(([k, v]) => walk(v, [...path, k]));
      }
    }
  }
  walk(obj, []);
  return map;
}
