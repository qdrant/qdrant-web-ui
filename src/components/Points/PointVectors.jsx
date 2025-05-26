import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Component for displaying vectors of a point
 * @param {Object} point
 * @param {function} onConditionChange
 * @returns {JSX.Element|null}
 * @constructor
 */
const Vectors = memo(function Vectors({ point, onConditionChange }) {
  const { collectionName } = useParams();
  const navigate = useNavigate();
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

  const handleNavigate = (key) => {
    navigate(`/collections/${collectionName}/graph`, { state: { newInitNode: point, vectorName: key } });
  };

  return (
    <Box pt={2}>
      Vectors:
      {Object.keys(vectors).map((key) => {
        return (
          <Grid key={key} container spacing={2}>
            <Grid my={1} size={4}>
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
            <Grid my={1} size={4}>
              <Typography variant="subtitle1" color="text.secondary" display={'inline'} mr={1}>
                Length:
              </Typography>
              <Chip
                label={
                  Array.isArray(vectors[key])
                    ? Array.isArray(vectors[key][0])
                      ? vectors[key].length + ' x ' + vectors[key][0].length
                      : vectors[key].length
                    : vectors[key].indices?.length
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid
              my={1}
              sx={{
                display: 'flex',
                justifyContent: 'end',
                gap: 2,
              }}
              size={4}
            >
              <Button variant="outlined" size="small" onClick={() => handleNavigate(key)}>
                Open graph
              </Button>
              {typeof onConditionChange !== 'function' ? null : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    onConditionChange([{ key: 'id', type: 'id', value: point.id }], key === '' ? null : key)
                  }
                >
                  Find Similar
                </Button>
              )}
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
});

Vectors.propTypes = {
  point: PropTypes.object.isRequired,
  onConditionChange: PropTypes.func,
};

export default Vectors;
