import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';

/**
 * Component for displaying vectors of a point
 * @param {Object} point
 * @returns {JSX.Element|null}
 * @constructor
 */
const Vectors = memo(function Vectors({ point, onConditionChange }) {
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
              <CopyButton
                text={bigIntJSON.stringify(vectors[key])}
                tooltip={'Copy vector to clipboard'}
                tooltipPlacement={'right'}
                successMessage={`Copied ${key === '' ? 'default vector' : 'vector ' + key} to clipboard`}
              />
            </Grid>

            <Grid item xs={4} my={1}>
              <Typography variant="subtitle1" color="text.secondary" display={'inline'} mr={1}>
                Length:
              </Typography>
              <Chip
                label={Array.isArray(vectors[key]) ? vectors[key].length : vectors[key].indices?.length}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={4} my={1} display={'flex'}>
              <Box sx={{ flexGrow: 1 }} />

              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  onConditionChange(
                    [
                      {
                        key: 'id',
                        type: 'id',
                        value: point.id,
                        label: key === '' ? `id: ${point.id}` : `id: ${point.id} using: ${key}`,
                        using: key,
                      },
                    ],
                    key === '' ? null : key
                  );
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
  onConditionChange: PropTypes.func.isRequired,
};

export default Vectors;
