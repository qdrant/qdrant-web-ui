import React from "react";
import { useParams } from "react-router-dom";
import { getCollectionsByName } from "../common/client";
import { Container, Box, Stack, Typography, Grid } from "@mui/material";
import PointCard from "../components/Collection/PointCard";

function Collection() {
  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);

  React.useEffect(() => {
    getCollectionsByName(collectionName).then((points) => {
      setPoints(points);
    });
  }, [collectionName]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
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
        </Container>
      </Box>
    </>
  );
}

export default Collection;
