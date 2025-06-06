import { describe, it, expect } from 'vitest';
import { getCreateCollectionConfiguration } from './create-collection';

describe('getCreateCollectionConfiguration', () => {
  it('should create configuration with basic dense vectors', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: {
        transformer: {
          dimension: 1536,
          distance: 'Euclid',
          multivector: false,
          rescoring: false,
          storage_tier: 'balanced',
          precision_tier: 'high'
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer).toEqual({
      size: 1536,
      distance: 'Euclid',
      multivector_config: null,
      on_disk: true,
      quantization_config: null,
      hnsw_config: {
        m: 24,
        payload_m: 24,
        ef_construct: 256
      },
      datatype: 'float32'
    });
  });

  it('should create configuration with sparse vectors', () => {
    const collectionName = 'test_collection';
    const configuration = {
      sparse_vectors: {
        minicoil: {
          precision_tier: 'high'
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.sparse_vectors_config.minicoil).toEqual({
      modifier: null,
      index: {
        on_disk: true,
        datatype: 'float32'
      }
    });
  });

  it('should create configuration with payload schema', () => {
    const collectionName = 'test_collection';
    const configuration = {
      payload_schema: {
        document: {
          type: 'text',
          tokenizer: 'whitespace',
          lowercase: true
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.payload_schema.document).toEqual({
      type: 'text',
      tokenizer: 'whitespace',
      lowercase: true,
      on_disk: false
    });
  });

  it('should create configuration with tenant key', () => {
    const collectionName = 'test_collection';
    const configuration = {
      tenant_key: 'user',
      dense_vectors: {
        transformer: {
          dimension: 1536,
          distance: 'Euclid'
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.payload_schema.user).toEqual({
      type: 'keyword',
      on_disk: false,
      is_tenant: true
    });
  });

  it('should create configuration with low precision tier', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: {
        transformer: {
          dimension: 1536,
          distance: 'Euclid',
          precision_tier: 'low'
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer).toEqual({
      size: 1536,
      distance: 'Euclid',
      multivector_config: null,
      on_disk: true,
      quantization_config: {
        binary: {
          always_ram: true
        }
      },
      hnsw_config: null,
      datatype: 'float16'
    });
  });

  it('should create configuration with storage tier', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: {
        transformer: {
          dimension: 1536,
          distance: 'Euclid',
          storage_tier: 'storage'
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer.on_disk).toBe(true);
  });

  it('should create configuration with multivector support', () => {
    const collectionName = 'test_collection';
    const configuration = {
      dense_vectors: {
        transformer: {
          dimension: 1536,
          distance: 'Euclid',
          multivector: true
        }
      }
    };

    const result = getCreateCollectionConfiguration(collectionName, configuration);

    expect(result.collection_name).toBe(collectionName);
    expect(result.vectors_config.transformer.multivector_config).toEqual({
      comparator: 'max_sim'
    });
  });
}); 