import _ from 'lodash';

/*
 * Check if the collection has named vectors
 * @param collectionInfo - Collection information object from getCollection API
 * @return {boolean} - true if the collection has named vectors, false otherwise
 */
export const isNamedVectors = (collectionInfo) => {
  // Check that collection.config.params.vectors?.size exists and integer
  return !collectionInfo?.config?.params.vectors?.size && _.isObject(collectionInfo?.config?.params?.vectors);
};

/*
 * Convert vectors config so that if the collection does not have named vectors,
 * it returns an object with an empty string key {'': vectorConfig }
 * @param collectionInfo - Collection information object from getCollection API
 * @return {Object}
 */
export const normalizeVectorConfigObject = (collectionInfo) => {
  return isNamedVectors(collectionInfo)
    ? collectionInfo?.config?.params?.vectors
    : { '': collectionInfo?.config?.params?.vectors };
};
