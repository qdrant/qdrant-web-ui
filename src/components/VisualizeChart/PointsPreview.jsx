import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { alpha, Box, Card, LinearProgress, Typography } from '@mui/material';
import { DataGridList } from '../Points/DataGridList';
import { bigIntJSON } from '../../common/bigIntJSON';
import { CopyButton } from '../Common/CopyButton';
import PointImage from '../Points/PointImage';

const PointsPreview = ({ points }) => {
  const theme = useTheme();
  const [loading] = React.useState(false);
  const payloadSchema = {};
  const onConditionChange = () => {};
  const conditions = [];

  console.log('points', points);
  if (!points || !points.length) {
    return null;
  }

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

        {points.map((point, index) => (
          <React.Fragment key={`${index}-${point.id}`}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                background: alpha(theme.palette.primary.main, 0.05),
                px: 3,
                py: 2,
                mb: 1,
              }}
            >
              <Typography variant="h6" component="h2">
                Point {point.id}
              </Typography>

              <CopyButton text={bigIntJSON.stringify(point)} />
            </Box>
            {point.payload && <PointImage data={point.payload} sx={{ width: 300, mx: 'auto' }} />}

            <Box px={3} pt={1} pb={5}>
              <DataGridList
                data={{ id: point.id, ...point.payload }}
                onConditionChange={onConditionChange}
                conditions={conditions}
                payloadSchema={payloadSchema}
              />
            </Box>
          </React.Fragment>
        ))}
      </Card>
    </>
  );
};

// prop types
PointsPreview.propTypes = {
  points: PropTypes.array,
};

export default memo(PointsPreview);
