import React from 'react';
import PropTypes from 'prop-types';
import { Card, Grid } from '@mui/material';

const VectorsConfigChip = ({ collectionConfigParams, sx = {} }) => {
  return (
    <>
      {collectionConfigParams.vectors.size && (
        <Grid container component={Card} variant={'heading'} p={1} sx={{ ...sx }}>
          <Grid align="center" mr={2}>
            default
          </Grid>
          <Grid align="center" mr={2}>
            {collectionConfigParams.vectors.size}
          </Grid>
          <Grid align="center" mr={2}>
            {collectionConfigParams.vectors.distance}
          </Grid>
          {/* model is not always present */}
          {collectionConfigParams.vectors.model && (
            <Grid align="center">
              {collectionConfigParams.vectors.model}
            </Grid>
          )}
        </Grid>
      )}
      {!collectionConfigParams.vectors.size &&
        Object.keys(collectionConfigParams.vectors).map((vector) => (
          <Grid key={vector} container component={Card} variant={'heading'} p={1} sx={{ ...sx }}>
            <Grid align="center" mr={2}>
              {vector}
            </Grid>
            <Grid align="center" mr={2}>
              {collectionConfigParams.vectors[vector].size}
            </Grid>
            <Grid align="center" mr={2}>
              {collectionConfigParams.vectors[vector].distance}
            </Grid>
            {/* model is not always present */}
            {collectionConfigParams.vectors[vector].model && (
              <Grid align="center">
                {collectionConfigParams.vectors[vector].model}
              </Grid>
            )}
          </Grid>
        ))}
      {collectionConfigParams.sparse_vectors &&
        Object.keys(collectionConfigParams.sparse_vectors).map((vector) => (
          <Grid key={vector} container component={Card} variant={'heading'} p={1} sx={{ ...sx }}>
            <Grid align="center" mr={2}>
              {vector}
            </Grid>
            <Grid align="center" mr={2}>
              Sparse
            </Grid>
            <Grid align="center" mr={2}></Grid>
          </Grid>
        ))}
    </>
  );
};

VectorsConfigChip.propTypes = {
  collectionConfigParams: PropTypes.object.isRequired,
  sx: PropTypes.object,
};

export default VectorsConfigChip;
