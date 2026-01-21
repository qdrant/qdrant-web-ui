/**
 * Check if two conditions are equal
 * @param {Object} a - First condition
 * @param {Object} b - Second condition
 * @return {boolean} True if conditions are equal
 */
export const isSameCondition = (a, b) => a.key === b.key && a.type === b.type && a.value === b.value;

/**
 * Remove duplicate conditions from a list
 * @param {Array} list - List of conditions
 * @return {Array} List with duplicates removed
 */
export const uniqConditions = (list) =>
  list.filter((item, index) => list.findIndex((candidate) => isSameCondition(candidate, item)) === index);

/**
 * Get display label for a similar condition
 * @param {Object} condition - The condition object
 * @return {string} Formatted label
 */
export const getSimilarConditionLabel = (condition) => `id: ${condition.value}`;

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
 * Parse filter string into payload conditions array
 * @param {string} filterText - Filter text to parse
 * @param {Object} payloadSchema - Schema object for value normalization
 * @return {Array} Array of parsed conditions
 */
export const parseFilterString = (filterText, payloadSchema) => {
  const tokens = filterText.match(/\S+/g) || [];
  const parsedConditions = [];

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

    let value;
    if (rawValue.toLowerCase() === 'null') {
      value = null;
    } else if (rawValue === '(empty)') {
      value = '';
    } else {
      value = normalizeValueBySchema(rawValue, key, payloadSchema);
    }
    parsedConditions.push({ key, type: 'payload', value });
  });

  return parsedConditions;
};

/**
 * Calculate horizontal offset for autocomplete popper positioning
 * @param {string} filterInputValue - Current filter input value
 * @param {number} currentWordStart - Start position of current word
 * @return {Array} Offset array [x, y]
 */
export const calculatePopperOffset = (filterInputValue, currentWordStart) => {
  // Get the text before the current word
  const textBeforeWord = filterInputValue.slice(0, currentWordStart);

  // Measure the width of text before the word using a canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Match the editor's font
  ctx.font = '1rem system-ui, -apple-system, sans-serif';
  const textWidth = ctx.measureText(textBeforeWord).width;

  // Add offset for the filter icon (approximately 24px for icon + margin)
  const iconOffset = 28;

  return [textWidth + iconOffset, 4];
};
