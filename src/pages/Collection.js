import React, { useState } from "react";
import { useParams } from "react-router-dom";
import qdrantClient from "../common/client";
import { Container, Box, Stack, Typography, Grid, Button } from "@mui/material";
import PointCard from "../components/Points/PointCard";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";

function Collection() {
  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [offset, setOffset] = React.useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  React.useEffect(() => {
    const getPoints = async () => {
      try {
        let points = await qdrantClient().scroll(collectionName, {})
        setPoints(points);
      } catch (error) {
        setHasError(true);
        setErrorMessage(error.message);
        setPoints({});
      }
    };
    getPoints()
  }, [collectionName, offset]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          my: 3,
        }}
      >
        {hasError && (
          <ErrorNotifier {...{ message: errorMessage, setHasError }} />
        )}
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{collectionName}</Typography>
          </Stack>
          <Grid container my={3} spacing={3}>
            {errorMessage && (
              <Typography mx={3}>Error: {errorMessage}</Typography>
            )}
            {!points && !errorMessage && (
              <Typography mx={3}>Loading...</Typography>
            )}
            {points && !errorMessage && points.points?.length === 0 && (
              <Typography mx={3}>
                No Points are presents, {collectionName} is empty
              </Typography>
            )}
            {points &&
              !errorMessage &&
              points.points?.map((point) => (
                <Grid xs={12} item key={point.id}>
                  <PointCard point={point} />
                </Grid>
              ))}
          </Grid>
          <Stack alignItems="center">
            <Button
              variant="outlined"
              onClick={() => {
                setOffset(points.next_page_offset);
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

export default Collection;
