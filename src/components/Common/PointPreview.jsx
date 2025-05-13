import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { alpha, Box, Card, CardContent, CardHeader, Grid, LinearProgress } from '@mui/material';
import { DataGridList } from '../Points/DataGridList';
import PointImage from '../Points/PointImage';
import Vectors from '../Points/PointVectors';

const PointPreview = ({ point }) => {
  const theme = useTheme();
  const [loading] = React.useState(false);
  const conditions = [];
  const payloadSchema = {};

  if (!point) {
    return null;
  }

  const sortedPayload = Object.keys(point.payload)
    .sort() // Sort the keys alphabetically
    .reduce((obj, key) => {
      obj[key] = point.payload[key]; // Rebuild the object with sorted keys
      return obj;
    }, {});

  return (
    <>
      <Card
        variant="dual"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '0',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
            }}
          >
            <LinearProgress />
          </Box>
        )}
        {Object.keys(point.payload).length > 0 && (
          <>
            <CardContent>
              <Grid container display={'flex'}>
                {point.payload && <PointImage data={point.payload} sx={{ width: 300, mx: 'auto' }} xs={12} />}
                <Grid my={1} size={12}>
                  <DataGridList
                    data={{ id: point.id, ...sortedPayload }}
                    conditions={conditions}
                    payloadSchema={payloadSchema}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </>
        )}
        {point?.vector && (
          <>
            <CardHeader
              subheader={'Vectors:'}
              sx={{
                flexGrow: 1,
                background: alpha(theme.palette.primary.main, 0.05),
              }}
            />
            <CardContent>
              <Vectors point={point} />
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
};

// prop types
PointPreview.propTypes = {
  point: PropTypes.object,
};

export default memo(PointPreview);
