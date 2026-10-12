import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

// Centered "collecting data" overlay shown over a chart until it has enough
// samples to draw. The spinner signals that polling is actively in progress
// rather than the chart being broken or empty. Absolutely positioned to sit on
// top of the (empty) canvas without shifting layout.
function CollectingOverlay({ label = 'Collecting data…' }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        pointerEvents: 'none',
      }}
    >
      <CircularProgress size={28} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

CollectingOverlay.propTypes = {
  label: PropTypes.string,
};

export default CollectingOverlay;
