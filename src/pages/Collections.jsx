import React, { useState, useEffect } from "react";
import qdrantClient from "../common/client";
import SearchBar from "../components/Collections/SearchBar";
import CollectionCard from "../components/Collections/CollectionCard";
import { Container, Box, Stack, Typography, Grid } from "@mui/material";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function getCollectionsCall() {
    try {
      let collections = await qdrantClient().getCollections();
      setRawCollections(collections.collections);
    } catch (error) {
      setHasError(true);
      setErrorMessage(error.message);
    }
  }

  useEffect(() => {
    getCollectionsCall();
  }, []);

  useEffect(() => {
    setCollections(
      rawCollections?.filter((user) => user.name.includes(searchQuery))
    );
  }, [searchQuery, rawCollections]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {hasError && (
          <ErrorNotifier {...{ message: errorMessage, setHasError }} />
        )}
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Collections</Typography>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Stack>
          <Grid container my={3} spacing={3}>
            {errorMessage && (
              <Typography mx={3}>Error: {errorMessage}</Typography>
            )}
            {!collections && !errorMessage && (
              <Typography mx={3}>Loading...</Typography>
            )}
            {collections && !errorMessage && collections.length === 0 && (
              <Typography mx={3}>No collection is present</Typography>
            )}
            {collections &&
              !errorMessage &&
              collections?.map((collection) => (
                <Grid xs={12} md={6} lg={4} item key={collection.name}>
                  <CollectionCard
                    collection={collection}
                    getCollectionsCall={getCollectionsCall}
                  />
                </Grid>
              ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default Collections;
