import React, { useState, useEffect } from 'react';
import { useClient } from '../context/client-context';
import SearchBar from '../components/Collections/SearchBar';
import { Typography, Grid } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { SnapshotsUpload } from '../components/Snapshots/SnapshotsUpload';
import { getErrorMessage } from '../lib/get-error-message';
import CollectionsList from '../components/Collections/CollectionsList';

function Collections() {
  // todo:
  // - [ ] pagination (lexicographical order)
  // - [ ] maybe move processing of absence of collections or error into CollectionsList?
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();

  async function getCollectionsCall() {
    try {
      const collections = await qdrantClient.getCollections();
      setRawCollections(collections.collections.sort((a, b) => a.name.localeCompare(b.name)));
      setErrorMessage(null);
    } catch (error) {
      const apiKey = qdrantClient.getApiKey();
      const message = getErrorMessage(error, { withApiKey: { apiKey } });
      message && setErrorMessage(message);
      setRawCollections(null);
    }
  }

  useEffect(() => {
    getCollectionsCall();
  }, []);

  useEffect(() => {
    setCollections(rawCollections?.filter((user) => user.name.includes(searchQuery)));
  }, [searchQuery, rawCollections]);

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier message={errorMessage} />}

        <Grid container alignItems="center">
          <Grid item xs={12} md={8}>
            <h1>Snapshots</h1>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'end' }}>
            <SnapshotsUpload onComplete={getCollectionsCall} key={'snapshots'} />
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

          {collections && !errorMessage && (
            <Grid xs={12} item>
              <CollectionsList collections={collections} getCollectionsCall={getCollectionsCall} />
            </Grid>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collections;
