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
import { useMaxCollections } from '../context/max-collections-context';

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const { maxCollections } = useMaxCollections();


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

        <Grid container maxWidth={'xl'} width={'100%'}>
          <Grid
            mb={4}
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Typography variant="h4" component={'h1'}>
              Collections {maxCollections && collections ? `(${collections.length} / ${maxCollections})` : ""}
            </Typography>
          </Grid>
          <Grid
            sx={{ display: 'flex', justifyContent: 'end', mb: 4 }}
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <SnapshotsUpload onComplete={() => getCollectionsCall(currentPage)} key={'snapshots'} />
          </Grid>
          <Grid size={12}>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Grid>

          {errorMessage && (
            <Grid textAlign={'center'} mt={3} size={12}>
              <Typography>⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          {!collections && !errorMessage && (
            <Grid textAlign={'center'} size={12}>
              <Typography>🔃 Loading...</Typography>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          )}
          {collections && !errorMessage && collections.length === 0 && (
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
