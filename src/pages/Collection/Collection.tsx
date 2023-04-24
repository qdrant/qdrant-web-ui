import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Container, Box, Stack, Typography, Grid, Button } from "@mui/material";
import { ErrorNotifier, PointCard } from "../../components";

import { useGetCollectionByName } from "../../hooks";

export function Collection() {
  const { collectionName } = useParams();
  const [offset, setOffset] = useState(0);

  const { data, error, isError, isLoading } = useGetCollectionByName({
    collectionName,
    offset,
  });

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          my: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{collectionName}</Typography>
          </Stack>
          <Grid container my={3} spacing={3}>
            {isError && <Typography mx={3}>Error: {error.message}</Typography>}
            {isLoading && <Typography mx={3}>Loading...</Typography>}
            {data?.points?.length === 0 && (
              <Typography mx={3}>
                No Points are presents, {collectionName} is empty
              </Typography>
            )}
            {data?.points &&
              !isError &&
              data?.points?.map((point: any) => (
                <Grid xs={12} item key={point.id}>
                  <PointCard point={point} />
                </Grid>
              ))}
          </Grid>
          <Stack alignItems="center">
            <Button
              variant="outlined"
              onClick={() => {
                data?.next_page_offset && setOffset(data?.next_page_offset);
              }}
            >
              Load More
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
