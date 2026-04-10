import { describe, expect, it } from 'vitest';
import { getDescriptionByPath } from './openapi-descriptions';

// Minimal OpenAPI-style schemas that cover all the resolution strategies:
// $ref, allOf, anyOf, oneOf, additionalProperties, nested properties.
const schemas = {
  CollectionInfo: {
    type: 'object',
    properties: {
      status: { $ref: '#/components/schemas/CollectionStatus' },
      optimizer_status: { $ref: '#/components/schemas/OptimizersStatus' },
      vectors_count: {
        description: 'Approximate number of vectors in collection',
        type: 'integer',
      },
      points_count: {
        description: 'Approximate number of points',
        type: 'integer',
      },
      config: { $ref: '#/components/schemas/CollectionConfig' },
      payload_schema: {
        description: 'Types of stored payload',
        type: 'object',
        additionalProperties: { $ref: '#/components/schemas/PayloadIndexInfo' },
      },
    },
  },

  CollectionStatus: {
    description: 'Green = all good, Yellow = optimization running',
    type: 'string',
    enum: ['green', 'yellow', 'grey', 'red'],
  },

  OptimizersStatus: {
    description: 'Current state of the optimizer',
    oneOf: [
      { type: 'string', enum: ['ok'] },
      {
        type: 'object',
        properties: {
          error: { description: 'Error message from optimizer', type: 'string' },
        },
      },
    ],
  },

  CollectionConfig: {
    description: 'Collection configuration',
    type: 'object',
    properties: {
      params: { $ref: '#/components/schemas/CollectionParams' },
      hnsw_config: { $ref: '#/components/schemas/HnswConfig' },
      optimizer_config: { $ref: '#/components/schemas/OptimizersConfig' },
      wal_config: { $ref: '#/components/schemas/WalConfig' },
    },
  },

  CollectionParams: {
    type: 'object',
    properties: {
      vectors: { $ref: '#/components/schemas/VectorsConfig' },
      shard_number: { description: 'Number of shards', type: 'integer' },
      replication_factor: { description: 'Number of replicas for each shard', type: 'integer' },
    },
  },

  // anyOf: single vector mode or named-vectors map
  VectorsConfig: {
    description: 'Vector params for single and multiple vector modes',
    anyOf: [
      { $ref: '#/components/schemas/VectorParams' },
      {
        type: 'object',
        additionalProperties: { $ref: '#/components/schemas/VectorParams' },
      },
    ],
  },

  VectorParams: {
    description: 'Params of single vector data storage',
    type: 'object',
    properties: {
      size: { description: 'Dimensionality of vectors', type: 'integer' },
      distance: { $ref: '#/components/schemas/Distance' },
      on_disk: { description: 'Store vectors on disk', type: 'boolean' },
    },
  },

  Distance: {
    description: 'Distance metric: Cosine, Euclid, Dot, or Manhattan',
    type: 'string',
    enum: ['Cosine', 'Euclid', 'Dot', 'Manhattan'],
  },

  HnswConfig: {
    type: 'object',
    properties: {
      m: { description: 'Edges per node in HNSW graph', type: 'integer' },
      ef_construct: { description: 'Neighbours during index building', type: 'integer' },
    },
  },

  OptimizersConfig: {
    type: 'object',
    properties: {
      deleted_threshold: { description: 'Min fraction of deleted vectors to optimize', type: 'number' },
      flush_interval_sec: { description: 'Minimum flush interval', type: 'integer' },
    },
  },

  WalConfig: {
    type: 'object',
    properties: {
      wal_capacity_mb: { description: 'WAL segment capacity in MB', type: 'integer' },
    },
  },

  PayloadIndexInfo: {
    description: 'Payload field index info',
    type: 'object',
    properties: {
      data_type: { description: 'Type of the payload field', type: 'string' },
      points: { description: 'Number of indexed points', type: 'integer' },
    },
  },

  // Schema using allOf to test merging
  ExtendedConfig: {
    allOf: [
      { $ref: '#/components/schemas/HnswConfig' },
      {
        type: 'object',
        properties: {
          extra_param: { description: 'An extra parameter', type: 'string' },
        },
      },
    ],
  },
};

describe('getDescriptionByPath', () => {
  describe('top-level fields', () => {
    it('returns description for a direct property', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['vectors_count'])).toBe(
        'Approximate number of vectors in collection',
      );
    });

    it('returns description for another direct property', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['points_count'])).toBe('Approximate number of points');
    });

    it('returns description for a property with additionalProperties', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['payload_schema'])).toBe('Types of stored payload');
    });
  });

  describe('$ref resolution', () => {
    it('resolves $ref to an enum schema and returns its description', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['status'])).toBe(
        'Green = all good, Yellow = optimization running',
      );
    });

    it('resolves $ref to a oneOf schema and returns its description', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['optimizer_status'])).toBe(
        'Current state of the optimizer',
      );
    });

    it('resolves $ref for a nested object and returns its description', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config'])).toBe('Collection configuration');
    });
  });

  describe('nested paths through $ref', () => {
    it('follows config -> hnsw_config -> m', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'hnsw_config', 'm'])).toBe(
        'Edges per node in HNSW graph',
      );
    });

    it('follows config -> optimizer_config -> deleted_threshold', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'optimizer_config', 'deleted_threshold'])).toBe(
        'Min fraction of deleted vectors to optimize',
      );
    });

    it('follows config -> wal_config -> wal_capacity_mb', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'wal_config', 'wal_capacity_mb'])).toBe(
        'WAL segment capacity in MB',
      );
    });

    it('follows config -> params -> shard_number', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'params', 'shard_number'])).toBe(
        'Number of shards',
      );
    });
  });

  describe('anyOf resolution', () => {
    it('resolves through anyOf to find VectorParams.size', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'params', 'vectors', 'size'])).toBe(
        'Dimensionality of vectors',
      );
    });

    it('resolves through anyOf to find VectorParams.distance ($ref to enum)', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'params', 'vectors', 'distance'])).toBe(
        'Distance metric: Cosine, Euclid, Dot, or Manhattan',
      );
    });

    it('resolves through anyOf to find VectorParams.on_disk', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'params', 'vectors', 'on_disk'])).toBe(
        'Store vectors on disk',
      );
    });
  });

  describe('oneOf resolution', () => {
    it('resolves through oneOf to find error field', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['optimizer_status', 'error'])).toBe(
        'Error message from optimizer',
      );
    });
  });

  describe('additionalProperties resolution', () => {
    it('resolves dynamic payload field keys via additionalProperties', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['payload_schema', 'my_field', 'data_type'])).toBe(
        'Type of the payload field',
      );
    });

    it('resolves named vector keys via anyOf + additionalProperties', () => {
      expect(
        getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'params', 'vectors', 'my_vector', 'size']),
      ).toBe('Dimensionality of vectors');
    });
  });

  describe('allOf merging', () => {
    it('finds properties from the base schema in allOf', () => {
      expect(getDescriptionByPath(schemas, 'ExtendedConfig', ['m'])).toBe('Edges per node in HNSW graph');
    });

    it('finds properties from the extension schema in allOf', () => {
      expect(getDescriptionByPath(schemas, 'ExtendedConfig', ['extra_param'])).toBe('An extra parameter');
    });
  });

  describe('edge cases', () => {
    it('returns null for empty path', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', [])).toBeNull();
    });

    it('returns null for non-existent field', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['nonexistent'])).toBeNull();
    });

    it('returns null for non-existent nested field', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', ['config', 'nonexistent'])).toBeNull();
    });

    it('returns null for non-existent root schema', () => {
      expect(getDescriptionByPath(schemas, 'NonExistent', ['foo'])).toBeNull();
    });

    it('returns null for null schemas', () => {
      expect(getDescriptionByPath(null, 'CollectionInfo', ['status'])).toBeNull();
    });

    it('returns null for null path', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', null)).toBeNull();
    });

    it('returns null for numeric path segment', () => {
      expect(getDescriptionByPath(schemas, 'CollectionInfo', [0])).toBeNull();
    });
  });
});
