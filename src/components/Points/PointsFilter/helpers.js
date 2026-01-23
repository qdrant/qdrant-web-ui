/**
 * Check if two filters are equal
 * @param {Object} a - First filter
 * @param {Object} b - Second filter
 * @return {boolean} True if filters are equal
 */
export const isSameFilter = (a, b) => a.key === b.key && a.value === b.value && !!a.isIdFilter === !!b.isIdFilter;

/**
 * Remove duplicate filters from a list
 * @param {Array} list - List of filters
 * @return {Array} List with duplicates removed
 */
export const uniqFilters = (list) =>
  list.filter((item, index) => list.findIndex((candidate) => isSameFilter(candidate, item)) === index);

/**
 * Parse similar input string to extract value
 * Returns the parsed value (number or string) or null if invalid
 * @param {string} rawInput - Raw input string
 * @return {number|string|null} Parsed value or null
 */
export const parseSimilarInput = (rawInput) => {
  const trimmedInput = (rawInput || '').trim();
  if (!trimmedInput) {
    return null;
  }

  const idMatch = trimmedInput.match(/^id\s*:\s*(.+)$/i);
  const valuePart = (idMatch ? idMatch[1] : trimmedInput).trim();
  if (!valuePart) {
    return null;
  }

  const numericLike = valuePart.match(/^-?\d+(\.\d+)?$/) ? Number(valuePart) : valuePart;
  return numericLike;
};

/**
 * Build filter input string from payload conditions
 * @param {Array} conditionsList - List of payload conditions
 * @return {string} Formatted filter string
 */
export const buildFilterInputFromConditions = (conditionsList) => {
  return conditionsList
    .map((condition) => {
      // Handle ID filter specially
      if (condition.isIdFilter) {
        return `id:${condition.value}`;
      }
      const readableValue = condition.value === null ? 'null' : condition.value === '' ? '(empty)' : condition.value;
      return `${condition.key}:${readableValue}`;
    })
    .join(' ');
};

/**
 * Extract the current word being typed at cursor position
 * @param {string} text - Input text
 * @param {number} cursorPos - Cursor position
 * @return {string} Current word at cursor
 */
export const getCurrentWord = (text, cursorPos) => {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/(\S+)$/);
  return match ? match[1] : '';
};

/**
 * Calculate the starting position of the current word
 * @param {string} text - Input text
 * @param {number} cursorPos - Cursor position
 * @return {number} Start position of current word
 */
export const getCurrentWordStart = (text, cursorPos) => {
  const beforeCursor = text.slice(0, cursorPos);
  const wordMatch = beforeCursor.match(/(\S*)$/);
  return wordMatch ? cursorPos - wordMatch[1].length : cursorPos;
};

/**
 * Normalize value based on payload schema data type
 * @param {string} valueString - Value string to normalize
 * @param {string} key - Payload key
 * @param {Object} payloadSchema - Schema object
 * @return {string|boolean|number} Normalized value
 */
export const normalizeValueBySchema = (valueString, key, payloadSchema) => {
  const schemaEntry = payloadSchema?.[key];
  if (!schemaEntry) {
    return valueString;
  }

  const dataType = schemaEntry.data_type;
  const lowered = valueString?.toString().toLowerCase();

  if (dataType === 'bool' && (lowered === 'true' || lowered === 'false')) {
    return lowered === 'true';
  }

  if ((dataType === 'integer' || dataType === 'int') && valueString !== '') {
    const numericValue = Number(valueString);
    return Number.isNaN(numericValue) ? valueString : numericValue;
  }

  if (dataType === 'float' && valueString !== '') {
    const floatValue = parseFloat(valueString);
    return Number.isNaN(floatValue) ? valueString : floatValue;
  }

  return valueString;
};

/**
 * Normalize filter input by removing whitespace after colons
 * Transforms "key: value" to "key:value"
 * @param {string} filterText - Filter text to normalize
 * @return {string} Normalized filter text
 */
export const normalizeFilterInput = (filterText) => {
  return filterText.replace(/:\s+/g, ':');
};

/**
 * Parse ID value from raw string (handles numeric and string IDs)
 * @param {string} rawValue - Raw ID value string
 * @return {number|string} Parsed ID value
 */
const parseIdValue = (rawValue) => {
  // Try to parse as integer (Qdrant supports integer IDs)
  const numericValue = Number(rawValue);
  if (!Number.isNaN(numericValue) && Number.isInteger(numericValue)) {
    return numericValue;
  }
  // Return as string (UUID or other string IDs)
  return rawValue;
};

/**
 * Parse filter string into filters array
 * @param {string} filterText - Filter text to parse
 * @param {Object} payloadSchema - Schema object for value normalization
 * @return {Array} Array of parsed filters { key, value, isIdFilter? }
 */
export const parseFilterString = (filterText, payloadSchema) => {
  const tokens = filterText.match(/\S+/g) || [];
  const parsedFilters = [];

  tokens.forEach((token) => {
    const colonIndex = token.indexOf(':');
    if (colonIndex === -1) {
      return;
    }

    const key = token.slice(0, colonIndex).trim();
    const rawValue = token.slice(colonIndex + 1).trim();

    if (!key || !rawValue) {
      return;
    }

    // Handle special 'id' filter for has_id condition
    if (key.toLowerCase() === 'id') {
      parsedFilters.push({ key: 'id', value: parseIdValue(rawValue), isIdFilter: true });
      return;
    }

    let value;
    if (rawValue.toLowerCase() === 'null') {
      value = null;
    } else if (rawValue === '(empty)') {
      value = '';
    } else {
      value = normalizeValueBySchema(rawValue, key, payloadSchema);
    }
    parsedFilters.push({ key, value });
  });

  return parsedFilters;
};

// Cached canvas and context for text measurement
let measureCanvas = null;
let measureCtx = null;

/**
 * Calculate horizontal offset for autocomplete popper positioning
 * @param {string} filterInputValue - Current filter input value
 * @param {number} currentWordStart - Start position of current word
 * @return {Array} Offset array [x, y]
 */
export const calculatePopperOffset = (filterInputValue, currentWordStart) => {
  // Get the text before the current word
  const textBeforeWord = filterInputValue.slice(0, currentWordStart);

  // Lazily create and cache the canvas for text measurement
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCtx = measureCanvas.getContext('2d');
    // Match the editor's font
    measureCtx.font = '1rem system-ui, -apple-system, sans-serif';
  }

  const textWidth = measureCtx.measureText(textBeforeWord).width;

  // Add offset for the filter icon (approximately 24px for icon + margin)
  const iconOffset = 28;

  return [textWidth + iconOffset, 4];
};
