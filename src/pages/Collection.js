import React from "react";
import { useParams } from "react-router-dom";
import { getCollectionsByName } from "../common/client";
import { Container, Box, Stack, Typography, Grid } from "@mui/material";
import CollectionCard from "../components/Collection/CollectionCard";

function Collection() {
  const { collectionName } = useParams();
  const [collection, setCollection] = React.useState(null);

  React.useEffect(() => {
    getCollectionsByName(collectionName).then((collection) => {
      console.log(collection);
      setCollection(collection);
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
            {collection && collection.points.map((collection) => (
              <Grid  xs={12}   item key={collection.name}>
                <CollectionCard
                  collection={collection}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  )

}

export default Collection;
