import { describe, it, expect } from 'vitest';
import { getCreateCollectionConfiguration, createCollection } from './create-collection';

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
      quantization_config: {
        binary: {
          always_ram: true,
        },
      },
      on_disk: true,
      hnsw_config: null,
      datatype: 'float16',
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

describe('createCollection', () => {
  it('should throw an error if collection already exists and recreate is false', async () => {
    const qdrantClient = {
      collectionExists: async () => ({ exists: true }),
      deleteCollection: async () => {},
      createCollection: async () => {},
      createPayloadIndex: async () => {},
    };
    const configuration = {
      collection_name: 'existing_collection',
      dense_vectors: [{ name: 'vec', size: 10, distance: 'Cosine' }],
      payload_indexes: [],
    };
    await expect(createCollection(qdrantClient, configuration, false)).rejects.toThrow(
      'Collection "existing_collection" already exists.'
    );
  });

  it('should delete and recreate collection if recreate is true', async () => {
    const deleteCollection = vi.fn();
    const createCollectionFn = vi.fn().mockResolvedValue(true);
    const qdrantClient = {
      collectionExists: async () => ({ exists: true }),
      deleteCollection,
      createCollection: createCollectionFn,
      createPayloadIndex: async () => {},
    };
    const configuration = {
      collection_name: 'existing_collection',
      dense_vectors: [{ name: 'vec', size: 10, distance: 'Cosine' }],
      payload_indexes: [],
    };
    await createCollection(qdrantClient, configuration, true);
    expect(deleteCollection).toHaveBeenCalledWith('existing_collection');
    expect(createCollectionFn).toHaveBeenCalled();
  });

  it('should create collection and payload indexes if collection does not exist', async () => {
    const createCollectionFn = vi.fn().mockResolvedValue(true);
    const createPayloadIndex = vi.fn();
    const qdrantClient = {
      collectionExists: async () => ({ exists: false }),
      deleteCollection: async () => {},
      createCollection: createCollectionFn,
      createPayloadIndex,
    };
    const configuration = {
      collection_name: 'new_collection',
      dense_vectors: [{ name: 'vec', size: 10, distance: 'Cosine' }],
      payload_indexes: [
        { name: 'field1', type: 'keyword', params: { on_disk: false } },
        { name: 'field2', type: 'integer', params: { on_disk: true } },
      ],
    };
    await createCollection(qdrantClient, configuration, false);
    expect(createCollectionFn).toHaveBeenCalledWith('new_collection', expect.any(Object));
    expect(createPayloadIndex).toHaveBeenCalledTimes(2);
    expect(createPayloadIndex).toHaveBeenCalledWith(
      'new_collection',
      expect.objectContaining({ field_name: 'field1' })
    );
    expect(createPayloadIndex).toHaveBeenCalledWith(
      'new_collection',
      expect.objectContaining({ field_name: 'field2' })
    );
  });
});
