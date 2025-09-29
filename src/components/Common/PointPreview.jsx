import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { alpha, Box, Typography, Card, CardContent, Divider, Alert } from '@mui/material';
import PointImage from '../Points/PointImage';
import PointPayload from '../Points/PointPayload';
import Vectors from '../Points/PointVectors';

// todo: fix this, reuse parts of PointCard.jsx where is possible, fix hardcoded parts
const PointPreview = ({ point }) => {
  const theme = useTheme();
  console.log('HEY RENDERING PointPreview');
  console.log('PointPreview render', point);

  if (!point) {
    return (
      <Alert severity="info" sx={{ m: 5 }}>
        Select a point to see its data preview
      </Alert>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 0,
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: alpha(theme.palette.action.hover, 0.08),
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          height: 48,
        }}
      >
        <Typography variant="h6">Point {point.id}</Typography>
      </Box>

      {/* Image Section */}
      {Object.keys(point.payload).length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <PointImage
              data={point.payload}
              sx={{
                width: 300,
                height: 300,
                borderRadius: 0.25,
                mx: 2,
                my: 3,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                'div:has(> &):after': {
                  // emulates a border after padding,
                  // only works in modern browsers
                  // but it is just a cosmetic tweak;
                  // needed to avoid adding extra logic to check if image is present
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Payload Section */}
      {Object.keys(point.payload).length > 0 && (
        <Box sx={{ flex: 1 }}>
          <Box sx={{ px: 2, py: 1 }}>
            <PointPayload point={point} showImage={false} onPayloadEdit={() => {}} />
          </Box>
        </Box>
      )}

      {/* Vectors Section */}
      {point?.vector && (
        <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.12)}` }}>
          <Divider />
          <CardContent sx={{ padding: '1rem' }}>{point?.vector && <Vectors point={point} />}</CardContent>
        </Box>
      )}
    </Card>
  );
};

PointPreview.propTypes = {
  point: PropTypes.object,
};

export default memo(PointPreview);
