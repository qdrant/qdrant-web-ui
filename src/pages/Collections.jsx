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
import CreateCollectionButton from '../components/Collections/CreateCollection/CreateCollectionButton';

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [filteredCollections, setFilteredCollections] = useState(null);
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
        const aliases = await qdrantClient.getAliases();
        const sortedCollections = allCollections.collections.sort((a, b) => a.name.localeCompare(b.name));
        setCollections(sortedCollections);

        const nextPageCollections = sortedCollections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        const nextRawCollections = await Promise.all(
          nextPageCollections.map(async (collection) => {
            const collectionData = await qdrantClient.getCollection(collection.name);
            const collectionAliases = aliases.aliases
              .filter((alias) => alias.collection_name === collection.name)
              .map((alias) => alias.alias_name);
            return {
              name: collection.name,
              ...collectionData,
              aliases: [...collectionAliases],
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

  const getFilteredCollectionsCall = useCallback(
    async (query) => {
      try {
        if (!collections) return;
        const filtered = collections.filter((collection) => collection.name.match(query));
        setFilteredCollections(filtered);
        const nextRawCollections = await Promise.all(
          filtered.map(async (collection) => {
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
      debouncedGetFilteredCollectionsCall(searchQuery);
    }
  }, [searchQuery, currentPage, getCollectionsCall]);

  const debouncedGetFilteredCollectionsCall = useMemo(
    () => debounce(getFilteredCollectionsCall, 100),
    [getFilteredCollectionsCall]
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const displayCollections = searchQuery ? filteredCollections : collections;

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier message={errorMessage} />}

        <Grid container maxWidth={'xl'} width={'100%'} spacing={3}>
          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <Typography variant="h4" component={'h1'} sx={{ lineHeight: '1' }}>
              Collections
            </Typography>
          </Grid>
          <Grid
            sx={{ display: 'flex', justifyContent: { md: 'end' }, gap: 2 }}
            size={{
              xs: 12,
              md: 7,
            }}
          >
            <CreateCollectionButton onComplete={() => getCollectionsCall(currentPage)} />
            <SnapshotsUpload onComplete={() => getCollectionsCall(currentPage)} key={'snapshots'} />
          </Grid>
          <Grid size={12} mb={2}>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Grid>

          {errorMessage && (
            <Grid textAlign={'center'} mt={3} size={12}>
              <Typography>⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          {!displayCollections && !errorMessage && (
            <Grid textAlign={'center'} size={12}>
              <Skeleton variant="rounded" height={70} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={70} animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={70} animation="wave" sx={{ mb: 1 }} />
            </Grid>
          )}
          {displayCollections && !errorMessage && displayCollections.length === 0 && (
            <Grid textAlign={'center'} mt={3} size={12}>
              <Typography> 📪 No collection is present</Typography>
            </Grid>
          )}

          {rawCollections?.length && !errorMessage ? (
            <Grid size={12}>
              <CollectionsList
                collections={rawCollections}
                getCollectionsCall={() => getCollectionsCall(currentPage)}
              />
              {displayCollections && displayCollections.length > PAGE_SIZE && (
                <Box justifyContent="center" display="flex" mt={3}>
                  <Pagination
                    shape={'rounded'}
                    count={Math.ceil(displayCollections.length / PAGE_SIZE)}
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
