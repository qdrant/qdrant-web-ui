import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useClient } from '../context/client-context';
import SearchBar from '../components/Collections/SearchBar';
import { Typography, Grid, Pagination, Box, Skeleton } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { SnapshotsUpload } from '../components/Snapshots/SnapshotsUpload';
import { getErrorMessage } from '../lib/get-error-message';
import CollectionsList from '../components/Collections/CollectionsList';
import { debounce } from 'lodash';
import CreateCollection from '../components/CreateCollection/Index';

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const getErrorMessageWithApiKey = useCallback(
    (error) => {
      const apiKey = qdrantClient.getApiKey();
      return getErrorMessage(error, { withApiKey: { apiKey } });
    },
    [qdrantClient]
  );

  const getCollectionsCall = useCallback(
    async (page = 1) => {
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
        const message = getErrorMessageWithApiKey(error);
        message && setErrorMessage(message);
        setRawCollections(null);
      }
    },
    [qdrantClient, getErrorMessageWithApiKey]
  );

  const getFilteredCollections = useCallback(
    async (query) => {
      try {
        const filteredCollections = collections.filter((collection) => collection.name.match(query));
        setCollections(filteredCollections);
        const nextRawCollections = await Promise.all(
          filteredCollections.map(async (collection) => {
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
        const message = getErrorMessageWithApiKey(error);
        message && setErrorMessage(message);
        setRawCollections(null);
      }
    },
    [collections, qdrantClient, getErrorMessageWithApiKey]
  );

  useEffect(() => {
    getCollectionsCall(currentPage);
  }, [currentPage, getCollectionsCall]);

  useEffect(() => {
    if (!searchQuery) {
      getCollectionsCall(currentPage);
    } else {
      debouncedGetFilteredCollections(searchQuery);
    }
  }, [searchQuery, currentPage, getCollectionsCall]);

  const debouncedGetFilteredCollections = useMemo(
    () => debounce(getFilteredCollections, 100),
    [getFilteredCollections]
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier message={errorMessage} />}

        <Grid container maxWidth={'xl'}>
          <Grid item xs={12} md={8} mb={4}>
            <Typography variant="h4" component={'h1'}>
              Collections
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'end', mb: 4, gap: 2 }}>
            <SnapshotsUpload onComplete={() => getCollectionsCall(currentPage)} key={'snapshots'} />
            <CreateCollection
              onComplete={() => getCollectionsCall(currentPage)}
              key={'create-collection'}
              collections={collections}
            />
          </Grid>
          <Grid xs={12} item>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Grid>

          {errorMessage && (
            <Grid xs={12} item textAlign={'center'} mt={3}>
              <Typography>⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          {!collections && !errorMessage && (
            <Grid xs={12} item textAlign={'center'}>
              <Typography>🔃 Loading...</Typography>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          )}
          {collections && !errorMessage && collections.length === 0 && (
            <Grid xs={12} item textAlign={'center'} mt={3}>
              <Typography> 📪 No collection is present</Typography>
            </Grid>
          )}

          {rawCollections?.length && !errorMessage ? (
            <Grid xs={12} item>
              <CollectionsList
                collections={rawCollections}
                getCollectionsCall={() => getCollectionsCall(currentPage)}
              />
              {collections.length > PAGE_SIZE && (
                <Box justifyContent="center" display="flex">
                  <Pagination
                    shape={'rounded'}
                    count={Math.ceil(collections.length / PAGE_SIZE)}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </Box>
              )}
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collections;
