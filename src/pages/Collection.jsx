import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useClient } from "../context/client-context";
import { Container, Box, Stack, Typography, Grid, Button } from "@mui/material";
import PointCard from "../components/Points/PointCard";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import SimilarSerachfield from "../components/Points/SimilarSerachfield";

function Collection() {
  const pageSize = 10;

  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [vector, setVector] = React.useState(null);
  const [offset, setOffset] = React.useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recommendationIds, setRecommendationIds] = useState([]);
  const {client: qdrantClient} = useClient(); 

  const [nextPageOffset, setNextPageOffset] = React.useState(null);

  const onIdsSelected = (ids, vectors) => {
    setOffset(null);
    setRecommendationIds(ids);
    if (vectors) setVector(vectors);
    if (ids.length === 0) {
      setPoints({ points: [] });
    }
  };

  React.useEffect(() => {
    // todo:
    // 1. if several vectors - button for each vector
    // 2. else - like now
    // 3. if several vectors - show name of each vector
    // 4. show if vector is removed
    const getPoints = async () => {
      if (recommendationIds.length !== 0) {
        try {
          let newPoints = await qdrantClient.recommend(collectionName, {
            positive: recommendationIds,
            limit: pageSize + (offset || 0),
            with_payload: true,
            with_vector: true,
            using: vector,
          })
          console.log(newPoints);
          setNextPageOffset(newPoints.length);
          setPoints({ points: newPoints });
          setErrorMessage(null);
        } catch (error) {
          setErrorMessage(error.message);
          setPoints({});
        }
      } else {

        try {
          let newPoints = await qdrantClient.scroll(collectionName, {
            offset,
            limit: pageSize,
            with_vector: true,
            with_payload: true
          });
          console.log(newPoints);
          setPoints({
            points: [
              ...points?.points || [],
              ...newPoints?.points || []
            ],
          });
          setNextPageOffset(newPoints?.next_page_offset);
          setErrorMessage(null);
        } catch (error) {
          setErrorMessage(error.message);
          setPoints({});
        }
      };
    }
    getPoints()
  }, [collectionName, offset, recommendationIds]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          my: 3,
        }}
      >
        {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )}
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">{collectionName}</Typography>
            <SimilarSerachfield
              value={recommendationIds}
              setValue={onIdsSelected}
            />
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
                  <PointCard
                    point={point}
                    setRecommendationIds={onIdsSelected}
                    collectionName={collectionName}
                  />
                </Grid>
              ))}
          </Grid>
          <Stack alignItems="center">
            <Button
              variant="outlined"
              disabled={!points || !nextPageOffset}
              onClick={() => {
                setOffset(nextPageOffset);
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
