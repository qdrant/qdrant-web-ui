function configureCollection({
  collectionName,
  isAccessible,
  isWritable,
  payloadFilters,
  configuredCollections,
  setConfiguredCollections,
}) {
  if (isAccessible) {
    // Add `selectedCollection` to `configuredCollections` with new settings
    const collectionAccess = {
      collection: collectionName,
    };

    collectionAccess.access = isWritable ? 'rw' : 'r';

    if (Object.keys(payloadFilters).length > 0) {
      collectionAccess.payload = payloadFilters;
    }

    const newConfiguredCollections = configuredCollections.filter((c) => c.collection !== collectionName);
    setConfiguredCollections([...newConfiguredCollections, collectionAccess]);
  } else {
    // Remove `selectedCollection` from `configuredCollections` if any
    const newConfiguredCollections = configuredCollections.filter((c) => c.collection !== collectionName);
    setConfiguredCollections(newConfiguredCollections);
  }
}

export default configureCollection;
