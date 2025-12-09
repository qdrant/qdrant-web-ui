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
    storage_tier: storageTier = StorageTier.BALANCED,
    precision_tier: precisionTier = PrecisionTier.HIGH,
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

  const result = {
    size: size,
    distance,
    on_disk: !originalInRam,
    hnsw_config: hnswConfig,
    datatype,
  };

  if (multivectorConfig) {
    result.multivector_config = multivectorConfig;
  }

  if (quantizationConfig) {
    result.quantization_config = quantizationConfig;
  }

  return result;
}

function getSparseVectorParams(sparseVectorConfig) {
  const { precision_tier: precisionTier = PrecisionTier.HIGH, use_idf: useIdf = false } = sparseVectorConfig;
  let datatype = null;
  

  if (precisionTier === PrecisionTier.LOW) {
    datatype = 'uint8';
  } else if (precisionTier === PrecisionTier.MEDIUM) {
    datatype = 'float16';
  } else if (precisionTier === PrecisionTier.HIGH) {
    datatype = null;
  }

  const result = {
    index: {
      on_disk: true,
    },
  };

  if (datatype) {
    result.index.datatype = datatype;
  }

  if (useIdf) {
    result.modifier = 'idf';
  }

  return result;
}

export function getCreateCollectionConfiguration(collectionName, configuration) {
  const isMultitenant = !!configuration.tenant_field;

  if (configuration.tenant_field && configuration.payload_indexes) {
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

export function createCollectionParams(params) {
  const collectionParams = {}

  if (params.vectors_config) {
    collectionParams.vectors = params.vectors_config;
  }

  if (params.sparse_vectors_config && Object.keys(params.sparse_vectors_config).length > 0) {
    collectionParams.sparse_vectors = params.sparse_vectors_config;
  }

  return collectionParams;
}

export function createPayloadIndexParams(params) {
  return {
    field_name: params.name,
    field_schema: {
      type: params.type,
      ...(params.params || {}),
    }
  };
}

export async function createCollection(qdrantClient, configuration, recreate = false) {
  const collectionName = configuration.collection_name;

  const collectionExists = await qdrantClient.collectionExists(collectionName).then((result) => result.exists);

  if (collectionExists) {
    // we currently do not use `recreate` option in UI to avoid accidental data loss
    if (recreate) {
      await qdrantClient.deleteCollection(collectionName);
    } else {
      throw new Error(`Collection "${collectionName}" already exists. Remove it first to recreate.`);
    }
  }

  const params = getCreateCollectionConfiguration(collectionName, configuration);

  const createParams = createCollectionParams(params);

  const collectionCreated = await qdrantClient.createCollection(params.collection_name, createParams);

  if (collectionCreated && params.payload_indexes) {
    for (const fieldConfig of params.payload_indexes) {
      const params = createPayloadIndexParams(fieldConfig);
      await qdrantClient.createPayloadIndex(collectionName, params);
    }
  }

  return collectionCreated;
}
