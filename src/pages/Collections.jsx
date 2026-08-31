import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useClient } from '../context/client-context';
import SearchBar from '../components/Collections/SearchBar';
import { Typography, Grid, Pagination, Box, Skeleton, IconButton, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { RefreshCw } from 'lucide-react';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';
import { SnapshotsUpload } from '../components/Snapshots/SnapshotsUpload';
import { getErrorMessage } from '../lib/get-error-message';
import CollectionsList from '../components/Collections/CollectionsList';
import { debounce } from 'lodash';
import { useMaxCollections } from '../context/telemetry-context';
import CreateCollectionButton from '../components/Collections/CreateCollection/CreateCollectionButton';
import ConfirmationDialog from '../components/Common/ConfirmationDialog';
import BulkActionsButton from '../components/Collections/BulkActionsButton';

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [filteredCollections, setFilteredCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { client: qdrantClient } = useClient();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [selectedCollections, setSelectedCollections] = useState(new Set());
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(null);
  const [bulkSnapshotError, setBulkSnapshotError] = useState(null);

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
            const collectionAliases = aliases.aliases
              .filter((alias) => alias.collection_name === collection.name)
              .map((alias) => alias.alias_name);
            try {
              const collectionData = await qdrantClient.getCollection(collection.name);
              return {
                name: collection.name,
                ...collectionData,
                aliases: [...collectionAliases],
              };
            } catch (error) {
              return {
                name: collection.name,
                error: getErrorMessageWithApiKey(error) || 'Failed to load collection info',
                aliases: [...collectionAliases],
              };
            }
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
            try {
              const collectionData = await qdrantClient.getCollection(collection.name);
              return {
                name: collection.name,
                ...collectionData,
              };
            } catch (error) {
              return {
                name: collection.name,
                error: getErrorMessageWithApiKey(error) || 'Failed to load collection info',
              };
            }
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
    setSelectedCollections(new Set());
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getCollectionsCall(currentPage);
    setIsRefreshing(false);
  }, [getCollectionsCall, currentPage]);

  const refreshCollection = useCallback(
    async (collectionName) => {
      setIsRefreshing(true);
      try {
        const collectionData = await qdrantClient.getCollection(collectionName);
        setRawCollections((prev) =>
          prev.map((c) => (c.name === collectionName ? { ...c, ...collectionData, error: null } : c))
        );
        setErrorMessage(null);
      } catch (error) {
        const message = getErrorMessageWithApiKey(error) || 'Failed to load collection info';
        setRawCollections((prev) => prev.map((c) => (c.name === collectionName ? { ...c, error: message } : c)));
      } finally {
        setIsRefreshing(false);
      }
    },
    [qdrantClient, getErrorMessageWithApiKey]
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setSelectedCollections(new Set());
  };

  const handleToggleSelect = useCallback((name) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (pageCollections) => {
      const allSelected = pageCollections.every((c) => selectedCollections.has(c.name));
      if (allSelected) {
        setSelectedCollections(new Set());
      } else {
        setSelectedCollections(new Set(pageCollections.map((c) => c.name)));
      }
    },
    [selectedCollections]
  );

  const handleBulkDelete = useCallback(async () => {
    const names = Array.from(selectedCollections);
    const errors = [];
    for (const name of names) {
      try {
        await qdrantClient.deleteCollection(name);
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
      }
    }
    setSelectedCollections(new Set());
    await getCollectionsCall(currentPage);
    if (errors.length > 0) {
      setBulkDeleteError(`Failed to delete: ${errors.join('; ')}`);
    }
  }, [selectedCollections, qdrantClient, getCollectionsCall, currentPage]);

  const handleBulkDownloadSnapshot = useCallback(async () => {
    const names = Array.from(selectedCollections);
    const errors = [];
    for (const name of names) {
      try {
        const snapshot = await qdrantClient.createSnapshot(name);
        const response = await qdrantClient.downloadSnapshot(name, snapshot.name);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = snapshot.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
      }
    }
    if (errors.length > 0) {
      setBulkSnapshotError(`Failed to download snapshot for: ${errors.join('; ')}`);
    }
  }, [selectedCollections, qdrantClient]);

  const displayCollections = searchQuery ? filteredCollections : collections;

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier message={errorMessage} />}

        <Grid container maxWidth={PAGE_CONTENT_WIDTH.wide} width={'100%'} spacing={3}>
          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <Typography
              variant="h4"
              component={'h1'}
              sx={{ lineHeight: '1', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Collections{' '}
              {maxCollections && displayCollections ? `(${displayCollections.length} / ${maxCollections})` : ''}
              <Tooltip title="Refresh collections">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    size="small"
                    aria-label="Refresh collections list"
                    sx={{ color: 'text.primary' }}
                  >
                    <RefreshCw
                      size="1.25rem"
                      style={{
                        animation: isRefreshing ? `${spin} 1s linear infinite` : 'none',
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Typography>
          </Grid>
          <Grid
            sx={{ display: 'flex', alignItems: 'center', justifyContent: { md: 'end' }, gap: 2 }}
            size={{
              xs: 12,
              md: 7,
            }}
          >
            {selectedCollections.size > 0 && (
              <BulkActionsButton
                count={selectedCollections.size}
                onDelete={() => setOpenBulkDeleteDialog(true)}
                onDownloadSnapshot={handleBulkDownloadSnapshot}
              />
            )}
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
                refreshCollection={refreshCollection}
                isRefreshing={isRefreshing}
                selectedCollections={selectedCollections}
                handleToggleSelect={handleToggleSelect}
                handleSelectAll={handleSelectAll}
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
      {bulkDeleteError && <ErrorNotifier message={bulkDeleteError} />}
      {bulkSnapshotError && <ErrorNotifier message={bulkSnapshotError} />}
      <ConfirmationDialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
        title={`Delete ${selectedCollections.size} collection${selectedCollections.size !== 1 ? 's' : ''}?`}
        content={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Array.from(selectedCollections).map((col) => (
              <li key={col}>{col}</li>
            ))}
          </ul>
        }
        warning={
          'Deleting collections cannot be undone. ' +
          'Make sure you have backed up all important data before proceeding.'
        }
        actionName={'Delete'}
        actionHandler={handleBulkDelete}
      />
    </>
  );
}

export default Collections;
