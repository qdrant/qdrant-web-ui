// todo:
// - [ ] let the user choose the number of collections to display per page ?
// - [ ] maybe move processing of absence of collections or error into CollectionsList?
import React, { useState, useEffect } from 'react';
import { useClient } from '../context/client-context';
import SearchBar from '../components/Collections/SearchBar';
import { Typography, Grid, Pagination, Box } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { SnapshotsUpload } from '../components/Snapshots/SnapshotsUpload';
import { getErrorMessage } from '../lib/get-error-message';
import CollectionsList from '../components/Collections/CollectionsList';

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  async function getCollectionsCall(page = 1) {
    try {
      const allCollections = await qdrantClient.getCollections();
      const sortedCollections = allCollections.collections.sort((a, b) => a.name.localeCompare(b.name));
      setCollections(sortedCollections);

      const nextPageCollections = sortedCollections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

      const nextRawCollections = await Promise.all(
        nextPageCollections.map(async (collection) => {
          const collectionData = await qdrantClient.getCollection(collection.name);
          return {
            name: collection.name,
            ...collectionData,
          };
        })
      );

      setRawCollections(nextRawCollections.sort((a, b) => a.name.localeCompare(b.name)));
      setErrorMessage(null);
    } catch (error) {
      const apiKey = qdrantClient.getApiKey();
      const message = getErrorMessage(error, { withApiKey: { apiKey } });
      message && setErrorMessage(message);
      setRawCollections(null);
    }
  }

  useEffect(() => {
    getCollectionsCall(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // todo: fix
    if (rawCollections) {
      setRawCollections(rawCollections.filter((collection) => collection.name.includes(searchQuery)));
    }
  }, [searchQuery]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier message={errorMessage} />}

        <Grid container alignItems="center">
          <Grid item xs={12} md={8}>
            <h1>Snapshots</h1>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'end' }}>
            <SnapshotsUpload onComplete={() => getCollectionsCall(currentPage)} key={'snapshots'} />
          </Grid>
          <Grid xs={12} item>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Grid>

          {errorMessage && (
            <Grid xs={12} item textAlign={'center'}>
              <Typography>⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          {!collections && !errorMessage && (
            <Grid xs={12} item textAlign={'center'}>
              <Typography>🔃 Loading...</Typography>
            </Grid>
          )}
          {collections && !errorMessage && collections.length === 0 && (
            <Grid xs={12} item textAlign={'center'}>
              <Typography> 📪 No collection is present</Typography>
            </Grid>
          )}

          {rawCollections && !errorMessage && (
            <Grid xs={12} item>
              <CollectionsList
                collections={rawCollections}
                getCollectionsCall={() => getCollectionsCall(currentPage)}
              />
              <Box justifyContent="center" display="flex">
                <Pagination
                  shape={'rounded'}
                  count={Math.ceil(collections.length / PAGE_SIZE)}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collections;
