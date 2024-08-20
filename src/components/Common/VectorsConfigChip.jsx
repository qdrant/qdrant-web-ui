import React from 'react';
import PropTypes from 'prop-types';
import { Card, Grid } from '@mui/material';

const VectorsConfigChip = ({ vectorsConfig }) => {
  return (
    <>
      {vectorsConfig.size && (
        <Grid container component={Card} variant={'heading'} p={1}>
          <Grid item align="center" mr={2}>
            default
          </Grid>
          <Grid item align="center" mr={2}>
            {vectorsConfig.size}
          </Grid>
          <Grid item align="center" mr={2}>
            {vectorsConfig.distance}
          </Grid>
          {/* model is not always present */}
          {vectorsConfig.model && (
            <Grid item align="center">
              {vectorsConfig.model}
            </Grid>
          )}
        </Grid>
      )}
      {!vectorsConfig.size &&
        Object.keys(vectorsConfig).map((vector) => (
          <Grid key={vector} container component={Card} variant={'heading'} p={1}>
            <Grid item align="center" mr={2}>
              {vector}
            </Grid>
            <Grid item align="center" mr={2}>
              {vectorsConfig[vector].size}
            </Grid>
            <Grid item align="center" mr={2}>
              {vectorsConfig[vector].distance}
            </Grid>
            {/* model is not always present */}
            {vectorsConfig[vector].model && (
              <Grid item align="center">
                {vectorsConfig[vector].model}
              </Grid>
            )}
          </Grid>
        ))}
    </>
  );
};

VectorsConfigChip.propTypes = {
  vectorsConfig: PropTypes.object.isRequired,
};

export default VectorsConfigChip;
