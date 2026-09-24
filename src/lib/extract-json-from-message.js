import { bigIntJSON } from '../common/bigIntJSON';

/**
 * Find the index of the bracket closing the one at `start`, skipping brackets inside JSON strings.
 * @param {string} text
 * @param {number} start - index of an opening `{` or `[`
 * @return {number} index of the closing bracket or -1
 */
const findClosingBracket = (text, start) => {
  const stack = [];
  let inString = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (char === '\\') {
        i++;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{' || char === '[') {
      stack.push(char === '{' ? '}' : ']');
    } else if (char === '}' || char === ']') {
      if (stack.pop() !== char) {
        return -1;
      }
      if (stack.length === 0) {
        return i;
      }
    }
  }
  return -1;
};

/**
 * Extract the first JSON object or array embedded in an error message.
 * @param {string} message
 * @return {null|{prefix: string, json: (Object|Array), suffix: string}}
 */
export const extractJsonFromMessage = (message) => {
  if (typeof message !== 'string') {
    return null;
  }

  for (let start = 0; start < message.length; start++) {
    const char = message[start];
    if (char !== '{' && char !== '[') {
      continue;
    }

    const end = findClosingBracket(message, start);
    if (end === -1) {
      continue;
    }

    let json;
    try {
      json = bigIntJSON.parse(message.slice(start, end + 1));
    } catch {
      continue;
    }

    // skip things like `[]` or `{}` that carry no details
    if (json === null || typeof json !== 'object' || Object.keys(json).length === 0) {
      continue;
    }

    return {
      prefix: message.slice(0, start).trim(),
      json,
      suffix: message.slice(end + 1).trim(),
    };
  }
  return null;
};
