import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { getCollectionsByName } from "../common/client";
import { Container, Box, Stack, Typography, Grid, Button } from "@mui/material";
import PointCard from "../components/Points/PointCard";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import { getSimilarPointsByID } from "../common/client";
import SimilarSerachfield from "../components/Points/SimilarSerachfield";

function Collection() {
  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [offset, setOffset] = React.useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recommendationIds, setRecommendationIds] = useState([]);

  React.useEffect(() => {
    if (recommendationIds.length !== 0) {
      getSimilarPointsByID(recommendationIds, collectionName)
        .then((rPoints) => {
          setPoints({ points: rPoints });
        })
        .catch(function (error) {
          setHasError(true);
          setErrorMessage(error.message);
          setPoints({});
        });
    } else {
      getCollectionsByName(collectionName, offset)
        .then((rPoints) => {
          if (points && points.next_page_offset) {
            if (points.points.length !== 0) {
              setPoints({
                points: [...points.points, ...rPoints.points],
                next_page_offset: rPoints.next_page_offset,
              });
            }
          } else {
            setPoints(rPoints);
          }
        })
        .catch(function (error) {
          setHasError(true);
          setErrorMessage(error.message);
          setPoints({});
        });
    }
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
              setValue={setRecommendationIds}
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
                    setRecommendationIds={setRecommendationIds}
                    collectionName={collectionName}
                  />
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
