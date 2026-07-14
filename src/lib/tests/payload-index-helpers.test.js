import { describe, it, expect } from 'vitest';
import {
  payloadFieldFormToIndexConfig,
  suggestFieldType,
  extractPayloadLeafFields,
  pathToIndexName,
} from '../payload-index-helpers';
import { createPayloadIndexParams } from '../../components/Collections/CreateCollection/create-collection';

describe('payloadFieldFormToIndexConfig', () => {
  it('converts keyword type with no extra params', () => {
    const result = payloadFieldFormToIndexConfig('color', { field_config_enum: 'keyword' });
    expect(result).toEqual({ name: 'color', type: 'keyword', params: {} });
  });

  it('converts integer type with range and lookup', () => {
    const result = payloadFieldFormToIndexConfig('age', {
      field_config_enum: 'integer',
      range: true,
      lookup: false,
    });
    expect(result).toEqual({ name: 'age', type: 'integer', params: { range: true, lookup: false } });
  });

  it('applies integer defaults when flags are omitted', () => {
    const result = payloadFieldFormToIndexConfig('count', { field_config_enum: 'integer' });
    expect(result.params).toEqual({ range: true, lookup: true });
  });

  it('converts text type with all params', () => {
    const result = payloadFieldFormToIndexConfig('title', {
      field_config_enum: 'text',
      lowercase: false,
      tokenizer: 'word',
      phrase_matching: false,
      min_token_len: 2,
      max_token_len: 10,
    });
    expect(result).toEqual({
      name: 'title',
      type: 'text',
      params: {
        lowercase: false,
        tokenizer: 'word',
        phrase_matching: false,
        min_token_len: 2,
        max_token_len: 10,
      },
    });
  });

  it('applies text defaults when params are omitted', () => {
    const result = payloadFieldFormToIndexConfig('body', { field_config_enum: 'text' });
    expect(result.params).toMatchObject({
      lowercase: true,
      tokenizer: 'whitespace',
      phrase_matching: true,
    });
    expect(result.params.min_token_len).toBeUndefined();
    expect(result.params.max_token_len).toBeUndefined();
  });

  it('ignores blank min/max token length values', () => {
    const result = payloadFieldFormToIndexConfig('body', {
      field_config_enum: 'text',
      min_token_len: '',
      max_token_len: '',
    });
    expect(result.params.min_token_len).toBeUndefined();
    expect(result.params.max_token_len).toBeUndefined();
  });

  it('converts float type (no extra params)', () => {
    const result = payloadFieldFormToIndexConfig('price', { field_config_enum: 'float' });
    expect(result).toEqual({ name: 'price', type: 'float', params: {} });
  });

  it('works with dot-notation nested field name', () => {
    const result = payloadFieldFormToIndexConfig('metadata.url', { field_config_enum: 'keyword' });
    expect(result.name).toBe('metadata.url');
  });

  it('round-trips through createPayloadIndexParams', () => {
    const config = payloadFieldFormToIndexConfig('age', { field_config_enum: 'integer', range: true, lookup: true });
    const params = createPayloadIndexParams(config);
    expect(params).toEqual({
      field_name: 'age',
      field_schema: { type: 'integer', range: true, lookup: true },
    });
  });
});

describe('suggestFieldType', () => {
  it('suggests bool for booleans', () => {
    expect(suggestFieldType(true)).toBe('bool');
  });

  it('suggests integer for whole numbers and bigints', () => {
    expect(suggestFieldType(42)).toBe('integer');
    expect(suggestFieldType(42n)).toBe('integer');
  });

  it('suggests float for decimals', () => {
    expect(suggestFieldType(3.14)).toBe('float');
  });

  it('suggests uuid for UUID strings', () => {
    expect(suggestFieldType('550e8400-e29b-41d4-a716-446655440000')).toBe('uuid');
  });

  it('suggests datetime for ISO date strings', () => {
    expect(suggestFieldType('2024-03-15T10:30:00Z')).toBe('datetime');
    expect(suggestFieldType('2024-03-15')).toBe('datetime');
  });

  it('suggests text for multi-word strings', () => {
    expect(suggestFieldType('hello beautiful world')).toBe('text');
  });

  it('suggests keyword for single-token strings', () => {
    expect(suggestFieldType('news')).toBe('keyword');
    expect(suggestFieldType('https://example.com')).toBe('keyword');
  });

  it('returns null when the value gives no hint', () => {
    expect(suggestFieldType(null)).toBeNull();
    expect(suggestFieldType(undefined)).toBeNull();
  });
});

describe('extractPayloadLeafFields', () => {
  it('collects primitive leaves with dot-notation paths', () => {
    const fields = extractPayloadLeafFields({
      title: 'hello',
      count: 42,
      metadata: { url: 'https://example.com', nested: { deep: true } },
    });
    expect(fields).toEqual([
      { name: 'title', value: 'hello' },
      { name: 'count', value: 42 },
      { name: 'metadata.url', value: 'https://example.com' },
      { name: 'metadata.nested.deep', value: true },
    ]);
  });

  it('indexes arrays of primitives at the array path', () => {
    const fields = extractPayloadLeafFields({
      tags: ['a', 'b'],
    });
    expect(fields).toEqual([{ name: 'tags', value: 'a' }]);
  });

  it('uses the [] notation for fields inside arrays of objects', () => {
    const fields = extractPayloadLeafFields({
      items: [{ sku: 'x1', variants: [{ color: 'red' }] }],
      nested: { list: [{ id: 7 }] },
    });
    expect(fields).toEqual([
      { name: 'items[].sku', value: 'x1' },
      { name: 'items[].variants[].color', value: 'red' },
      { name: 'nested.list[].id', value: 7 },
    ]);
  });

  it('keeps null leaves as options without a sample value', () => {
    expect(extractPayloadLeafFields({ maybe: null })).toEqual([{ name: 'maybe', value: null }]);
  });

  it('returns an empty list for empty or missing payload', () => {
    expect(extractPayloadLeafFields({})).toEqual([]);
    expect(extractPayloadLeafFields(undefined)).toEqual([]);
  });
});

describe('pathToIndexName', () => {
  it('keeps plain object paths as dot notation', () => {
    expect(pathToIndexName(['metadata', 'url'])).toBe('metadata.url');
  });

  it('targets the array field for primitive array elements', () => {
    expect(pathToIndexName(['tags', 0])).toBe('tags');
    expect(pathToIndexName(['tags', '1'])).toBe('tags');
  });

  it('folds array indices into the [] notation', () => {
    expect(pathToIndexName(['items', 0, 'sku'])).toBe('items[].sku');
    expect(pathToIndexName(['items', 2, 'variants', 1, 'color'])).toBe('items[].variants[].color');
  });

  it('handles arrays nested under objects', () => {
    expect(pathToIndexName(['meta', 'list', 1])).toBe('meta.list');
  });
});
