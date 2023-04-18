import React from "react";
import { useParams } from "react-router-dom";
import { getCollectionsByName } from "../common/client";
import { Container, Box, Stack, Typography, Grid ,Button } from "@mui/material";
import PointCard from "../components/Collection/PointCard";

function Collection() {
  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    getCollectionsByName(collectionName, offset).then((rPoints) => {
      if (points) {
        if (points.points.length !== 0) {
          setPoints({ points: [...points.points, ...rPoints.points], next_page_offset: rPoints.next_page_offset });
        }
      }
      else {
        setPoints(rPoints);
      }
    });
  }, [collectionName,offset]);

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
            {points &&
              points.points.map((point) => (
                <Grid xs={12} item key={point.id}>
                  <PointCard point={point} />
                </Grid>
              ))}
          </Grid>
          <Stack alignItems="center" >
            <Button variant="outlined" onClick={() => { setOffset(points.next_page_offset) }}>
              Load More
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default Collection;
