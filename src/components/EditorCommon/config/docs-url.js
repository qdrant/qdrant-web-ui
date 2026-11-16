const DOCS_BASE_URL = 'https://api.qdrant.tech/api-reference/';

// Deprecated Search endpoints (search, recommend, discover) no longer have a
// page on api.qdrant.tech; the Query API replaced all of them.
const QUERY_API_DOCS_PATH = 'search/query-points';

// Build the api.qdrant.tech documentation URL for an OpenAPI operation
// ({ operationId, tags, deprecated }).
export function getDocsUrl(operation) {
  if (operation.deprecated) {
    return DOCS_BASE_URL + QUERY_API_DOCS_PATH;
  }
  const tag = operation.tags[0].toLowerCase();
  // The docs slug drops the `search-` prefix on the matrix endpoints
  // (`search_matrix_pairs` is published as `matrix-pairs`).
  const operationId = operation.operationId
    .replace(/^search_matrix_/, 'matrix_')
    .replaceAll('_', '-')
    .toLowerCase();
  return DOCS_BASE_URL + tag + '/' + operationId;
}
