import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { CopyAll } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

/**
 * Component for displaying vectors of a point
 * @param {Object} point
 * @returns {JSX.Element|null}
 * @constructor
 */
const Vectors = memo(function Vectors({ point, setRecommendationIds, onCopy }) {
  if (!Object.getOwnPropertyDescriptor(point, 'vector')) {
    return null;
  }

  // to unify the code, we will convert the vector to an object
  // when there is only one vector in the point
  let vectors = {};
  if (Array.isArray(point.vector)) {
    vectors[''] = point.vector;
  } else {
    vectors = point.vector;
  }

  return (
    <Box pt={2}>
      {Object.keys(vectors).map((key) => {
        return (
          <Grid key={key} container spacing={2}>
            <Grid item xs={4} my={1}>
              {key === '' ? (
                <Typography variant="subtitle1" color="text.secondary" display={'inline'} mr={1}>
                  Default vector
                </Typography>
              ) : (
                <>
                  <Typography variant="subtitle1" color="text.secondary" display={'inline'} mr={1}>
                    Name:
                  </Typography>
                  <Chip label={key} size="small" variant="outlined" sx={{ mr: 1 }} />
                </>
              )}
              <Tooltip title="Copy Vector" placement="right">
                <IconButton
                  aria-label={`copy vector ${key}`}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(vectors[key]));
                    if (typeof onCopy === 'function') onCopy();
                  }}
                >
                  <CopyAll />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item xs={4} my={1}>
              <Typography variant="subtitle1" color="text.secondary" display={'inline'} mr={1}>
                Length:
              </Typography>
              <Chip label={vectors[key].length} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={4} my={1} display={'flex'}>
              <Box sx={{ flexGrow: 1 }} />

              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setRecommendationIds([point.id], key === '' ? null : key);
                }}
              >
                Find Similar
              </Button>
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
});

Vectors.propTypes = {
  point: PropTypes.object.isRequired,
  setRecommendationIds: PropTypes.func.isRequired,
  onCopy: PropTypes.func,
};

export default Vectors;
