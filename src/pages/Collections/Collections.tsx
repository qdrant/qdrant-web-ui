import { useState, useEffect } from "react";
import { useHotkeys } from "@mantine/hooks";

import { Container, Box, Stack, Typography, Grid } from "@mui/material";

import { CollectionCard, SearchBar, ErrorNotifier } from "../../components";
import { useGetCollections } from "../../hooks";

export function Collections() {
  const [rawCollections, setRawCollections] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isError, data, error, isLoading, refetch } = useGetCollections();

  async function getCollectionsCall() {
    console.log("refetching");
    refetch();
  }

  useHotkeys([["ctrl+Enter", () => getCollectionsCall()]]);

  useEffect(() => {
    setRawCollections(
      data?.collections?.filter((user: any) => user.name.includes(searchQuery))
    );
  }, [data, searchQuery]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {isError && (
          <ErrorNotifier
            {...{ message: error.message, setHasError: (e) => console.log(e) }}
          />
        )}
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Collections</Typography>
            <SearchBar value={searchQuery} setValue={setSearchQuery} />
          </Stack>
          <Grid container my={3} spacing={3}>
            {error?.message && (
              <Typography mx={3}>Error: {error?.message}</Typography>
            )}
            {isLoading && <Typography mx={3}>Loading...</Typography>}
            {data && !isError && data.collections.length === 0 && (
              <Typography mx={3}>No collection is present</Typography>
            )}
            {rawCollections &&
              !isError &&
              rawCollections?.map((collection: any) => (
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
