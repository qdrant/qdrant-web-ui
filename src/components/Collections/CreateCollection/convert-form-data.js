// copied from https://github.com/qdrant/serverless-mvp/blob/master/frontend/src/api/formToApi.ts
// Example:

// Form data:

/*
let exampleResult = {
    "collection_name": "test-collection",
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
            "storage_tier": "medium",
            "precision_tier": "high"
        }
    ],
    "sparse_vectors": [
        {
            "name": "sparse1",
            "use_idf": true,
            "storage_tier": "medium",
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
                "min_token_len": null,
                "max_token_len": null,
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

/*
{
  "collection_name": "string",
  "cluster_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "configuration": {
    "tenant_key": "string",
    "dense_vectors": {
      "additionalProp1": {
        "dimension": 0,
        "distance": "Cosine",
        "multivector": false,
        "rescoring": false,
        "storage_tier": "cold",
        "precision_tier": "low"
      },
      "additionalProp2": {
        "dimension": 0,
        "distance": "Cosine",
        "multivector": false,
        "rescoring": false,
        "storage_tier": "cold",
        "precision_tier": "low"
      },
      "additionalProp3": {
        "dimension": 0,
        "distance": "Cosine",
        "multivector": false,
        "rescoring": false,
        "storage_tier": "cold",
        "precision_tier": "low"
      }
    },
    "sparse_vectors": {
      "additionalProp1": {
        "precision_tier": "low",
        "modifier": "none"
      },
      "additionalProp2": {
        "precision_tier": "low",
        "modifier": "none"
      },
      "additionalProp3": {
        "precision_tier": "low",
        "modifier": "none"
      }
    },
    "payload_schema": {
      "additionalProp1": {
        "type": "keyword",
        "is_tenant": true,
        "on_disk": true
      },
      "additionalProp2": {
        "type": "keyword",
        "is_tenant": true,
        "on_disk": true
      },
      "additionalProp3": {
        "type": "keyword",
        "is_tenant": true,
        "on_disk": true
      }
    }
  }
}
*/
export function convertFromDataToApi(data) {
  const denseVectors = {};
  const sparseVectors = {};
  const payloadSchema = {};

  if (data.dense_vectors) {
    data.dense_vectors.forEach((vector) => {
      console.debug('Converting dense vector:', vector);
      denseVectors[vector.name] = {
        dimension: vector.size,
        distance: vector.distance,
        multivector: vector.multivector,
        rescoring: false,
        storage_tier: vector.storage_tier,
        precision_tier: vector.precision_tier,
      };
    });
  }

  if (data.sparse_vectors) {
    data.sparse_vectors.forEach((vector) => {
      console.debug('Converting sparse vector:', vector);
      sparseVectors[vector.name] = {
        precision_tier: vector.precision_tier,
        modifier: vector.modifier,
      };
    });
  }

  if (data.payload_indexes) {
    data.payload_indexes.forEach((payload) => {
      console.debug('Converting payload index:', payload);
      payloadSchema[payload.name] = {
        type: payload.type,
        lookup: payload.params && payload.params.lookup,
        range: payload.params && payload.params.range,
        tokenizer: payload.params && payload.params.tokenizer,
        lowercase: payload.params && payload.params.lowercase,
        min_token_len: payload.params && payload.params.min_token_len,
        max_token_len: payload.params && payload.params.max_token_len,
      };
    });
  }

  const ret = {
    collection_name: data.collection_name,
    configuration: {
      tenant_key: data.tenant_field && data.tenant_field.name,
      dense_vectors: denseVectors,
      sparse_vectors: sparseVectors,
      payload_schema: payloadSchema,
    },
  };
  console.debug('Converted data:', ret);
  return ret;
}
