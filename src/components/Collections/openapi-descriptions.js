/**
 * Resolve a $ref pointer like "#/components/schemas/Foo" to the actual schema object.
 *
 * @param {object} schema - A schema that may contain a $ref
 * @param {object} schemas - All component schemas from the OpenAPI spec
 * @return {object|null} The resolved schema, or null if unresolvable
 */
function resolveRef(schema, schemas) {
  if (!schema?.$ref) return schema;
  const name = schema.$ref.replace('#/components/schemas/', '');
  return schemas[name] ?? null;
}

/**
 * Resolve a schema fully: follow $ref, then merge allOf if present.
 * Returns a flat schema with { properties, description, ... }.
 *
 * @param {object} schema - A schema that may contain $ref or allOf
 * @param {object} schemas - All component schemas
 * @return {object|null} Resolved schema
 */
function resolveSchema(schema, schemas) {
  if (!schema) return null;
  const resolved = resolveRef(schema, schemas);
  if (!resolved) return null;

  if (resolved.allOf) {
    let mergedProperties = {};
    let description = resolved.description;
    for (const sub of resolved.allOf) {
      const subResolved = resolveSchema(sub, schemas);
      if (subResolved?.properties) {
        mergedProperties = { ...mergedProperties, ...subResolved.properties };
      }
      if (!description && subResolved?.description) {
        description = subResolved.description;
      }
    }
    return { ...resolved, properties: mergedProperties, description };
  }

  return resolved;
}

/**
 * Look up a property name in a schema, handling anyOf/oneOf variants
 * and additionalProperties for dynamic keys.
 *
 * @param {object} resolved - A resolved schema object
 * @param {string} key - The property name to find
 * @param {object} schemas - All component schemas
 * @return {object|null} The property schema, or null
 */
function findProperty(resolved, key, schemas) {
  if (!resolved) return null;

  // Direct properties
  if (resolved.properties?.[key]) {
    return resolved.properties[key];
  }

  // anyOf / oneOf — try each variant
  const variants = resolved.anyOf || resolved.oneOf;
  if (variants) {
    for (const variant of variants) {
      const variantResolved = resolveSchema(variant, schemas);
      const found = findProperty(variantResolved, key, schemas);
      if (found) return found;
    }
  }

  // additionalProperties — for dynamic keys (named vectors, payload fields, etc.)
  if (resolved.additionalProperties) {
    const addPropsSchema = resolveSchema(resolved.additionalProperties, schemas);
    if (addPropsSchema) return addPropsSchema;
  }

  return null;
}

/**
 * Get the description for a field at the given path within a root schema.
 *
 * Follows the JSON path through the OpenAPI schema hierarchy, resolving
 * $ref pointers, allOf merges, anyOf/oneOf variants, and additionalProperties.
 *
 * @param {object} schemas - `spec.components.schemas` from an OpenAPI spec
 * @param {string} rootSchemaName - Name of the root schema (e.g. "CollectionInfo")
 * @param {Array<string|number>} path - JSON path segments (e.g. ["config", "hnsw_config", "m"])
 * @return {string|null} The description string, or null if not found
 */
export function getDescriptionByPath(schemas, rootSchemaName, path) {
  if (!schemas || !rootSchemaName || !path?.length) return null;

  const rootSchema = schemas[rootSchemaName];
  if (!rootSchema) return null;

  let current = resolveSchema(rootSchema, schemas);
  let propertySchema = null;

  for (const segment of path) {
    if (typeof segment !== 'string') return null;

    propertySchema = findProperty(current, segment, schemas);
    if (!propertySchema) return null;

    // Move into this property for the next segment
    current = resolveSchema(propertySchema, schemas);
  }

  // Return the description from the property itself, or from its resolved target
  return propertySchema?.description || current?.description || null;
}

// --- Loader (singleton-cached fetch) ---

let descriptionsCache = null;

/**
 * Fetch openapi.json and return the parsed schemas object.
 * The fetch is deduped so multiple callers share a single request.
 *
 * @return {Promise<object>} The components.schemas object
 */
export function loadOpenApiSchemas() {
  if (!descriptionsCache) {
    descriptionsCache = fetch(import.meta.env.BASE_URL + './openapi.json')
      .then((res) => res.json())
      .then((spec) => spec.components?.schemas ?? {})
      .catch(() => ({}));
  }
  return descriptionsCache;
}
