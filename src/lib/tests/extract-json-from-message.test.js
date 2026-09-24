import { describe, it, expect } from 'vitest';
import { extractJsonFromMessage } from '../extract-json-from-message';

describe('extractJsonFromMessage', () => {
  it('should return null for plain text', () => {
    expect(extractJsonFromMessage('Collection `test` not found')).toBeNull();
  });

  it('should return null for non-string messages', () => {
    expect(extractJsonFromMessage(undefined)).toBeNull();
    expect(extractJsonFromMessage(null)).toBeNull();
  });

  it('should extract JSON embedded in text', () => {
    const result = extractJsonFromMessage(
      'Failed to create index: Wrong input: {"field": "city", "code": 42} (try again)'
    );
    expect(result).toEqual({
      prefix: 'Failed to create index: Wrong input:',
      json: { field: 'city', code: 42 },
      suffix: '(try again)',
    });
  });

  it('should handle nested objects and brackets inside strings', () => {
    const result = extractJsonFromMessage('Error: {"a": {"b": [1, 2]}, "c": "text with } and ]"}');
    expect(result.json).toEqual({ a: { b: [1, 2] }, c: 'text with } and ]' });
    expect(result.suffix).toBe('');
  });

  it('should skip bracketed text that is not valid JSON', () => {
    const result = extractJsonFromMessage('Vector [dense] is invalid: {"dim": 128}');
    expect(result.prefix).toBe('Vector [dense] is invalid:');
    expect(result.json).toEqual({ dim: 128 });
  });

  it('should return null for invalid or unbalanced JSON', () => {
    expect(extractJsonFromMessage('Error: {"a": 1')).toBeNull();
    expect(extractJsonFromMessage('Error: {a: 1}')).toBeNull();
  });

  it('should ignore empty objects and arrays', () => {
    expect(extractJsonFromMessage('Nothing here: {} []')).toBeNull();
  });

  it('should extract JSON arrays', () => {
    expect(extractJsonFromMessage('Errors: [{"x": 1}]').json).toEqual([{ x: 1 }]);
  });
});
