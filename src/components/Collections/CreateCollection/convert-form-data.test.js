import { describe, it, expect } from 'vitest';
import { convertFromDataToApi } from './convert-form-data';

describe('convertFromDataToApi', () => {
  it('converts full form data to API format', () => {
    const input = {
      collection_name: 'test-collection',
      tenant_field: { name: 'user-id', type: 'keyword' },
      dense_vectors: [
        {
          name: 'dense1',
          size: 128,
          distance: 'Cosine',
          multivector: false,
          storage_tier: 'medium',
          precision_tier: 'high',
        },
      ],
      sparse_vectors: [
        {
          name: 'sparse1',
          precision_tier: 'high',
          modifier: 'none',
        },
      ],
      payload_indexes: [
        {
          name: 'user-id',
          type: 'keyword',
        },
        {
          name: 'test-field',
          type: 'text',
          params: {
            lowercase: true,
            tokenizer: 'whitespace',
            min_token_len: 2,
            max_token_len: 10,
          },
        },
      ],
    };

    const result = convertFromDataToApi(input);

    expect(result).toEqual({
      collection_name: 'test-collection',
      configuration: {
        tenant_key: 'user-id',
        dense_vectors: {
          dense1: {
            dimension: 128,
            distance: 'Cosine',
            multivector: false,
            rescoring: false,
            storage_tier: 'medium',
            precision_tier: 'high',
          },
        },
        sparse_vectors: {
          sparse1: {
            precision_tier: 'high',
            modifier: 'none',
          },
        },
        payload_schema: {
          'user-id': {
            type: 'keyword',
            lookup: undefined,
            range: undefined,
            tokenizer: undefined,
            lowercase: undefined,
            min_token_len: undefined,
            max_token_len: undefined,
          },
          'test-field': {
            type: 'text',
            lookup: undefined,
            range: undefined,
            tokenizer: 'whitespace',
            lowercase: true,
            min_token_len: 2,
            max_token_len: 10,
          },
        },
      },
    });
  });

  it('handles missing vectors and payloads', () => {
    const input = {
      collection_name: 'empty-collection',
      tenant_field: null,
      dense_vectors: [],
      sparse_vectors: [],
      payload_indexes: [],
    };

    const result = convertFromDataToApi(input);

    console.log('Result:', result);
    expect(result).toEqual({
      collection_name: 'empty-collection',
      configuration: {
        tenant_key: null,
        dense_vectors: {},
        sparse_vectors: {},
        payload_schema: {},
      },
    });
  });

  it('handles missing optional fields', () => {
    const input = {
      collection_name: 'partial-collection',
    };

    const result = convertFromDataToApi(input);

    expect(result).toEqual({
      collection_name: 'partial-collection',
      configuration: {
        tenant_key: undefined,
        dense_vectors: {},
        sparse_vectors: {},
        payload_schema: {},
      },
    });
  });

  it('handles payload index with params missing', () => {
    const input = {
      collection_name: 'payload-collection',
      payload_indexes: [
        {
          name: 'field1',
          type: 'integer',
        },
      ],
    };

    const result = convertFromDataToApi(input);

    expect(result.configuration.payload_schema.field1).toEqual({
      type: 'integer',
      lookup: undefined,
      range: undefined,
      tokenizer: undefined,
      lowercase: undefined,
      min_token_len: undefined,
      max_token_len: undefined,
    });
  });
});
