/**
 * Helpers for working with payload indexes: converting form state into
 * index configuration and inspecting point payloads for indexable fields.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRIMITIVE_TYPES = ['string', 'number', 'boolean', 'bigint'];

/**
 * Convert a single field form state (from ButtonGroupWithInputs) into
 * the { name, type, params } shape expected by createPayloadIndexParams.
 *
 * fieldFormData shape: { field_config_enum: 'text', tokenizer: 'word', lowercase: true, … }
 *
 * @param {string} fieldName - dot-notation field path (e.g. "metadata.url")
 * @param {Object} fieldFormData - form state for the field_config element
 * @return {{ name: string, type: string, params: Object }}
 */
export function payloadFieldFormToIndexConfig(fieldName, fieldFormData) {
  const type = fieldFormData?.field_config_enum;
  const params = {};

  if (type === 'text') {
    params.lowercase = fieldFormData?.lowercase ?? true;
    params.tokenizer = fieldFormData?.tokenizer || 'whitespace';
    params.phrase_matching = fieldFormData?.phrase_matching ?? true;

    const minLength = fieldFormData?.min_token_len;
    const maxLength = fieldFormData?.max_token_len;

    if (minLength !== undefined && minLength !== '') {
      const value = typeof minLength === 'number' ? minLength : parseInt(minLength, 10);
      if (!isNaN(value) && value >= 0) params.min_token_len = value;
    }
    if (maxLength !== undefined && maxLength !== '') {
      const value = typeof maxLength === 'number' ? maxLength : parseInt(maxLength, 10);
      if (!isNaN(value) && value >= 0) params.max_token_len = value;
    }
  } else if (type === 'integer') {
    params.range = fieldFormData?.range ?? true;
    params.lookup = fieldFormData?.lookup ?? true;
  }

  return { name: fieldName, type, params };
}

/**
 * Suggest an index type from a sample payload value. Returns null when
 * the value gives no hint (for example null).
 *
 * @param {*} value - payload field value
 * @return {string|null} index field type or null
 */
export function suggestFieldType(value) {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'bigint') return 'integer';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
  if (typeof value === 'string') {
    if (UUID_REGEX.test(value)) return 'uuid';
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) return 'datetime';
    // Multi-word strings read as natural language — suggest full-text search.
    if (/\s/.test(value.trim())) return 'text';
    return 'keyword';
  }
  return null;
}

/**
 * Whether a json-viewer path segment is an array index.
 *
 * @param {string|number} segment - path segment
 * @return {boolean} true for array indices
 */
export function isArrayIndexSegment(segment) {
  return typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment));
}

/**
 * Convert a json-viewer path into a Qdrant index field name. Array indices are
 * folded into the [] notation ("items[].sku") — plain dots would create an
 * index that matches nothing. An index on array elements themselves targets
 * the array field, so trailing brackets are dropped ("tags").
 *
 * @param {Array} path - json-viewer path segments (strings and array indices)
 * @return {string} Qdrant index field name
 */
export function pathToIndexName(path) {
  const name = path.reduce((acc, segment) => {
    if (isArrayIndexSegment(segment)) return `${acc}[]`;
    return acc ? `${acc}.${segment}` : String(segment);
  }, '');
  return name.replace(/(\[\])+$/, '');
}

/**
 * Collect indexable leaf fields from a point payload, each with a sample value
 * for type suggestion. Arrays of primitives are indexed at the array path
 * ("tags"); fields inside arrays of objects use the [] notation required by
 * Qdrant ("items[].sku") — plain dots would create an index that matches nothing.
 *
 * @param {Object} payload - point payload object
 * @param {Array} prefix - current path segments (used for recursion)
 * @return {Array<{name: string, value: *}>} unique leaf fields
 */
export function extractPayloadLeafFields(payload, prefix = []) {
  const fields = new Map();
  const add = (entries) => {
    for (const entry of entries) {
      if (!fields.has(entry.name)) fields.set(entry.name, entry);
    }
  };
  for (const [key, value] of Object.entries(payload || {})) {
    const path = [...prefix, key];
    if (value === null || PRIMITIVE_TYPES.includes(typeof value)) {
      add([{ name: path.join('.'), value }]);
    } else if (Array.isArray(value)) {
      const sample = value.find((item) => item === null || PRIMITIVE_TYPES.includes(typeof item));
      if (sample !== undefined) add([{ name: path.join('.'), value: sample }]);
      const nested = value.find((item) => item && typeof item === 'object' && !Array.isArray(item));
      if (nested) add(extractPayloadLeafFields(nested, [...prefix, `${key}[]`]));
    } else if (typeof value === 'object') {
      add(extractPayloadLeafFields(value, path));
    }
  }
  return [...fields.values()];
}
