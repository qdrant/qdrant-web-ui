import { enhanceSnippet } from './snippetEnhancer';

describe('snippetEnhancer', () => {
  it('should replace collection placeholders with the actual collection names', () => {
    const snippet =
      'PUT /collections/${1:collection_name}/shards\n' +
      '        {\n' +
      '         "shard_key": ${2:shared_key}\n' +
      '        }';
    const collections = ['my_collection', 'second_collection', 'anotherOne'];
    const enhancedSnippet = enhanceSnippet(snippet, collections);
    expect(enhancedSnippet).toBe(
      'PUT /collections/${1|my_collection,second_collection,anotherOne|}/shards\n' +
        '        {\n' +
        '         "shard_key": ${2:shared_key}\n' +
        '        }'
    );
  });

  it('should replace collection placeholders with the actual collection names', () => {
    const snippet =
      'PUT /collections/${9:collection_name}/shards\n' +
      '        {\n' +
      '         "shard_key": ${2:shared_key}\n' +
      '        }';
    const collections = ['my_collection', 'second_collection', 'anotherOne'];
    const enhancedSnippet = enhanceSnippet(snippet, collections);
    expect(enhancedSnippet).toBe(
      'PUT /collections/${9|my_collection,second_collection,anotherOne|}/shards\n' +
        '        {\n' +
        '         "shard_key": ${2:shared_key}\n' +
        '        }'
    );
  });

  it('should not replace collection placeholders if there are no collections', () => {
    const snippet =
      'PUT /collections/${1:collection_name}/shards\n' +
      '        {\n' +
      '         "shard_key": ${2:shared_key}\n' +
      '        }';
    const collections = [];
    const enhancedSnippet = enhanceSnippet(snippet, collections);
    expect(enhancedSnippet).toBe(snippet);
  });

  it('should not replace collection placeholders if there are no collection placeholders', () => {
    const snippet =
      'PUT /collections/collection_name/shards\n' +
      '        {\n' +
      '         "shard_key": ${2:shared_key}\n' +
      '        }';
    const collections = ['my_collection', 'second_collection', 'anotherOne'];
    const enhancedSnippet = enhanceSnippet(snippet, collections);
    expect(enhancedSnippet).toBe(snippet);
  });
});
