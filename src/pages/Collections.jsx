import React, { useState, useEffect } from 'react';
import { useClient } from '../context/client-context';
import SearchBar from '../components/Collections/SearchBar';
import CollectionCard from '../components/Collections/CollectionCard';
import { Typography, Grid } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { SnapshotsUpload } from '../components/Snapshots/SnapshotsUpload';

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();

  async function getCollectionsCall() {
    try {
      const collections = await qdrantClient.getCollections();
      setRawCollections(collections.collections);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
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
        {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
        <Grid container maxWidth={'xl'} spacing={3}>
          <Grid xs={12} item>
            <Typography variant="h4">Collections</Typography>
          </Grid>
          <Grid xs={12} item>
            <SearchBar
              value={searchQuery}
              setValue={setSearchQuery}
              actions={[<SnapshotsUpload onComplete={getCollectionsCall} key={'snapshots'} />]}
            />
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
          {collections &&
            !errorMessage &&
            collections?.map((collection) => (
              <Grid xs={12} md={6} lg={4} item key={collection.name}>
                <CollectionCard collection={collection} getCollectionsCall={getCollectionsCall} />
              </Grid>
            ))}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collections;
