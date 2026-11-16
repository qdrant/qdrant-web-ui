import { describe, expect, it } from 'vitest';
import { getDocsUrl } from '../config/docs-url';

const BASE = 'https://api.qdrant.tech/api-reference/';

describe('getDocsUrl', () => {
  it('joins the lowercased tag and the kebab-cased operation id', () => {
    expect(getDocsUrl({ operationId: 'upsert_points', tags: ['Points'] })).toBe(BASE + 'points/upsert-points');
    expect(getDocsUrl({ operationId: 'query_points', tags: ['Search'] })).toBe(BASE + 'search/query-points');
  });

  it('drops the search- prefix on the matrix endpoints', () => {
    expect(getDocsUrl({ operationId: 'search_matrix_pairs', tags: ['Search'] })).toBe(BASE + 'search/matrix-pairs');
    expect(getDocsUrl({ operationId: 'search_matrix_offsets', tags: ['Search'] })).toBe(BASE + 'search/matrix-offsets');
  });

  it('points deprecated operations at the Query API page', () => {
    for (const operationId of ['search_points', 'recommend_batch_points', 'discover_points']) {
      expect(getDocsUrl({ operationId, tags: ['Search'], deprecated: true })).toBe(BASE + 'search/query-points');
    }
  });
});
