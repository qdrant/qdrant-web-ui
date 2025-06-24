import { describe, it, expect } from 'vitest';
import { getCreateCollectionConfiguration } from './create-collection';

describe('getCreateCollectionConfiguration', () => {
  it('should create configuration with basic dense vectors', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: [
        {
          name: 'transformer',
          size: 1536,
          distance: 'Euclid',
          multivector: false,
          rescoring: false,
          storage_tier: 'balanced',
          precision_tier: 'high',
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer).toMatchObject({
      size: 1536,
      distance: 'Euclid',
      multivector_config: null,
      on_disk: false,
      quantization_config: null,
      hnsw_config: expect.anything(),
      datatype: 'float32',
    });
  });

  it('should create configuration with sparse vectors', () => {
    const collectionName = 'test_collection';
    const configuration = {
      sparse_vectors: [
        {
          name: 'minicoil',
          precision_tier: 'high',
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.sparse_vectors_config.minicoil).toMatchObject({
      modifier: null,
      index: {
        on_disk: true,
        datatype: expect.any(String),
      },
    });
  });

  it('should create configuration with payload schema', () => {
    const collectionName = 'test_collection';
    const configuration = {
      payload_indexes: [
        {
          name: 'document',
          type: 'text',
          params: {
            tokenizer: 'whitespace',
            lowercase: true,
            on_disk: false,
          },
        },
      ],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.payload_indexes[0]).toMatchObject({
      name: 'document',
      type: 'text',
      params: expect.objectContaining({
        tokenizer: 'whitespace',
        lowercase: true,
        on_disk: false,
      }),
    });
  });

  it('should create configuration with tenant key', () => {
    const collectionName = 'test_collection';
    const configuration = {
      tenant_field: {
        name: 'user',
        type: 'keyword',
      },
      dense_vectors: [
        {
          name: 'transformer',
          size: 1536,
          distance: 'Euclid',
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.payload_indexes.find((i) => i.name === 'user')).toMatchObject({
      name: 'user',
      type: 'keyword',
      params: expect.objectContaining({
        on_disk: false,
        is_tenant: true,
      }),
    });
  });

  it('should create configuration with low precision tier', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: [
        {
          name: 'transformer',
          size: 1536,
          distance: 'Euclid',
          precision_tier: 'low',
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer).toMatchObject({
      size: 1536,
      distance: 'Euclid',
      multivector_config: null,
      on_disk: false,
      quantization_config: null,
      hnsw_config: expect.anything(),
      datatype: 'float32',
    });
  });

  it('should create configuration with storage tier', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: [
        {
          name: 'transformer',
          size: 1536,
          distance: 'Euclid',
          storage_tier: 'storage',
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer.on_disk).toBe(false);
  });

  it('should create configuration with multivector support', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: [
        {
          name: 'transformer',
          size: 1536,
          distance: 'Euclid',
          multivector: true,
        },
      ],
      payload_indexes: [],
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer.multivector_config).toEqual({
      comparator: 'max_sim',
    });
  });
});
