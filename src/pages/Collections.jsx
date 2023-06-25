import React, { useState, useEffect } from "react";
import { useClient } from "../context/client-context";
import SearchBar from "../components/Collections/SearchBar";
import CollectionCard from "../components/Collections/CollectionCard";
import { Box, Typography, Grid } from "@mui/material";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";

function Collections() {
  const [rawCollections, setRawCollections] = useState(null);
  const [collections, setCollections] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const { client: qdrantClient } = useClient();

  async function getCollectionsCall() {
    try {
      let collections = await qdrantClient.getCollections();
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
          p: 3,
        }}
      >
        {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )}
          <Grid container maxWidth={"xl"} spacing={3}>
            <Grid lg={12} item >
              <Typography variant="h4">Collections</Typography>
            </Grid>
            <Grid lg={12} item >
              <SearchBar value={searchQuery} setValue={setSearchQuery} />
            </Grid>

            {errorMessage && (
              <Grid lg={12} item >
                <Typography >Error: {errorMessage}</Typography>
              </Grid>
            )}
            {!collections && !errorMessage && (
              <Grid lg={12} item >
                <Typography >Loading...</Typography>
              </Grid>
            )}
            {collections && !errorMessage && collections.length === 0 && (
              <Grid lg={12} item >
                <Typography >No collection is present</Typography>

              </Grid>
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
      </Box>
    </>
  );
}

export default Collections;
