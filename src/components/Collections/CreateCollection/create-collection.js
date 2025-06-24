/*

This function creates a collection in Qdrant by provided collection description.

Example of collection description:

{
    "collection_name": "example-collection",
    "tenant_field": {
        "name": "user-id",
        "type": "keyword"
    },
    "dense_vectors": [
        {
            "name": "dense1",
            "size": 512,
            "distance": "Euclid",
            "multivector": false,
            "storage_tier": "balanced",
            "precision_tier": "high"
        }
    ],
    "sparse_vectors": [
        {
            "name": "sparse1",
            "use_idf": true,
            "storage_tier": "balanced",
            "precision_tier": "high"
        }
    ],
    "payload_indexes": [
        {
            "name": "user-id",
            "type": "keyword"
        },
        {
            "name": "test-field",
            "type": "text",
            "params": {
                "lowercase": true,
                "tokenizer": "whitespace",
                "min_token_length": null,
                "max_token_length": null,
            }
        },
        {
            "name": "org-id",
            "type": "integer",
            "params": {
                "range": false,
                "lookup": true
            }
        }
    ],
}


*/

const StorageTier = {
  STORAGE: 'storage',
  BALANCED: 'balanced',
  PERFORMANCE: 'performance',
};

const PrecisionTier = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

function getVectorParams(denseVectorConfig, isMultitenant) {
  const {
    size,
    distance,
    multivector = false,
    rescoring = false,
    storageTier = StorageTier.BALANCED,
    precisionTier = PrecisionTier.HIGH,
  } = denseVectorConfig;

  let multivectorConfig = null;
  if (multivector) {
    multivectorConfig = {
      comparator: 'max_sim',
    };
  }

  let hnswConfig = null;
  let quantizationConfig = null;
  let quantizedInRam = true;
  let originalInRam = true;
  let datatype = null;

  if (storageTier === StorageTier.STORAGE) {
    if (isMultitenant) {
      quantizedInRam = false;
    }
    originalInRam = false;
  } else if (storageTier === StorageTier.BALANCED) {
    originalInRam = false;
    quantizedInRam = true;
  } else if (storageTier === StorageTier.PERFORMANCE) {
    originalInRam = true;
    quantizedInRam = true;
  }

  if (precisionTier === PrecisionTier.LOW) {
    datatype = 'float16';
    if (size >= 1024) {
      quantizationConfig = {
        binary: {
          always_ram: quantizedInRam,
        },
      };
    } else {
      quantizationConfig = {
        scalar: {
          type: 'int8',
          always_ram: quantizedInRam,
          quantile: 0.99,
        },
      };
    }
  } else if (precisionTier === PrecisionTier.MEDIUM) {
    datatype = 'float32';
    quantizationConfig = {
      scalar: {
        type: 'int8',
        always_ram: quantizedInRam,
        quantile: 0.99,
      },
    };
  } else if (precisionTier === PrecisionTier.HIGH) {
    datatype = 'float32';
    quantizationConfig = null;
    hnswConfig = {
      m: 24,
      payload_m: 24,
      ef_construct: 256,
    };
    if (isMultitenant) {
      originalInRam = false;
    } else {
      originalInRam = true;
    }
  }

  if (rescoring) {
    hnswConfig = {
      m: 0,
      payload_m: 0,
    };
  }

  if (isMultitenant) {
    if (hnswConfig) {
      hnswConfig.m = 0;
    } else {
      hnswConfig = {
        m: 0,
        payload_m: 16,
      };
    }
  }

  return {
    size: size,
    distance,
    multivector_config: multivectorConfig,
    on_disk: !originalInRam,
    quantization_config: quantizationConfig,
    hnsw_config: hnswConfig,
    datatype,
  };
}

function getSparseVectorParams(sparseVectorConfig) {
  const { precisionTier = PrecisionTier.HIGH, modifier = null } = sparseVectorConfig;
  let datatype = null;

  if (precisionTier === PrecisionTier.LOW) {
    datatype = 'uint8';
  } else if (precisionTier === PrecisionTier.MEDIUM) {
    datatype = 'float16';
  } else if (precisionTier === PrecisionTier.HIGH) {
    datatype = 'float32';
  }

  return {
    modifier,
    index: {
      on_disk: true,
      datatype,
    },
  };
}

export function getCreateCollectionConfiguration(collectionName, configuration) {
  const isMultitenant = !!configuration.tenant_field;

  if (configuration.tenant_field) {
    configuration.payload_indexes.push({
      name: configuration.tenant_field.name,
      type: configuration.tenant_field.type,
      params: {
        on_disk: false,
        is_tenant: true,
        is_principal: true,
      },
    });
  }

  const vectorsConfig = {};
  if (configuration.dense_vectors) {
    for (const vectorConfig of configuration.dense_vectors) {
      const vectorName = vectorConfig.name;
      vectorsConfig[vectorName] = getVectorParams(vectorConfig, isMultitenant);
    }
  }

  const sparseVectorsConfig = {};
  if (configuration.sparse_vectors) {
    for (const vectorConfig of configuration.sparse_vectors) {
      const vectorName = vectorConfig.name;
      sparseVectorsConfig[vectorName] = getSparseVectorParams(vectorConfig);
    }
  }

  return {
    collection_name: collectionName,
    vectors_config: vectorsConfig,
    sparse_vectors_config: sparseVectorsConfig,
    payload_indexes: configuration.payload_indexes,
  };
}

export async function createCollection(qdrantClient, configuration, recreate = false) {
  const collectionName = configuration.collection_name;

  const collectionExists = await qdrantClient.collectionExists(collectionName).then((result) => result.exists);

  if (collectionExists) {
    if (recreate) {
      await qdrantClient.deleteCollection(collectionName);
    } else {
      return false;
    }
  }

  const params = getCreateCollectionConfiguration(collectionName, configuration);

  const createParams = {
    vectors: params.vectors_config,
    sparse_vectors: params.sparse_vectors_config,
  };

  const collectionCreated = await qdrantClient.createCollection(params.collection_name, createParams);

  if (collectionCreated && params.payload_indexes) {
    for (const fieldConfig of params.payload_indexes) {
      const fieldName = fieldConfig.name;
      const fieldSchema = {
        type: fieldConfig.type,
        ...(fieldConfig.params || {}),
      };
      await qdrantClient.createPayloadIndex(collectionName, { field_name: fieldName, field_schema: fieldSchema });
    }
  }

  return collectionCreated;
}
