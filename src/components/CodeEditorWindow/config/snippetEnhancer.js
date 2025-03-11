/**
 * This function take a snippet and looks up for collection placeholders and replaces them with the actual collection names
 * Example input:
 * PUT /collections/${1:collection_name}/shards
 * {
 *  "shard_key": ${2:shared_key}
 * }
 *
 * Example output:
 * PUT /collections/${1|my_collection,second_collection,anotherOne|}/shards
 * {
 *  "shard_key": ${2:shared_key}
 * }
 * @param {string} snippet - the snippet to enhance
 * @param {Array} collections - the collections to use for autocompletion
 * @return {string} - the enhanced snippet
 */
export const snippetEnhancer = (snippet, collections) => {
    let enhancedSnippet = snippet;
    const collectionPlaceholders = enhancedSnippet.match(/\$\{(\d+):collection_name\}/g);
    if (collectionPlaceholders) {
        for (const collectionPlaceholder of collectionPlaceholders) {
            const placeholderId = collectionPlaceholder.match(/\d+/)[0];
            if (collections.length > 0) {
                const collectionAutocomplete = `\${${placeholderId}|${collections.join(",")}|}`;
                enhancedSnippet = enhancedSnippet.replace(collectionPlaceholder, collectionAutocomplete);
            }
        }
    }
    return enhancedSnippet;
}