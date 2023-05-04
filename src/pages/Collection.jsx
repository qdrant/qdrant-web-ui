import React, { useState } from "react";
import { useParams } from "react-router-dom";
import qdrantClient from "../common/client";
import { Container, Box, Stack, Typography, Grid, Button } from "@mui/material";
import PointCard from "../components/Points/PointCard";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import SimilarSerachfield from "../components/Points/SimilarSerachfield";

function Collection() {
  const pageSize = 10;

  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [offset, setOffset] = React.useState(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recommendationIds, setRecommendationIds] = useState([]);

  const [nextPageOffset, setNextPageOffset] = React.useState(null);

  const onIdsSelected = (ids) => {
    setOffset(null);
    setRecommendationIds(ids);
    if (ids.length === 0) {
      setPoints({ points: [] });
    }
  };

  React.useEffect(() => {
    const getPoints = async () => {
      if (recommendationIds.length !== 0) {
        try {
          let newPoints = await qdrantClient().recommend(collectionName, {
            positive: recommendationIds,
            limit: pageSize + (offset || 0),
            with_payload: true,
            with_vector: false,
          });
          setNextPageOffset(newPoints.length);
          setPoints({ points: newPoints });
        } catch (error) {
          setHasError(true);
          setErrorMessage(error.message);
          setPoints({});
        }
      } else {
        try {
          let newPoints = await qdrantClient().scroll(collectionName, {
            offset,
            limit: pageSize,
          });
          setPoints({
            points: [...(points?.points || []), ...(newPoints?.points || [])],
          });
          setNextPageOffset(newPoints?.next_page_offset);
        } catch (error) {
          setHasError(true);
          setErrorMessage(error.message);
          setPoints({});
        }
      }
    };
    getPoints();
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
        {hasError && (
          <ErrorNotifier {...{ message: errorMessage, setHasError }} />
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
