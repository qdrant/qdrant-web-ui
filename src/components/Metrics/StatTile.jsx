import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography } from '@mui/material';
import { formatValue } from '../../lib/metrics-parser';

// A single big-number tile, mirroring Grafana's "stat" panels.
function StatTile({ label, value, unit = 'number' }) {
  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
        {value === null || value === undefined ? '—' : formatValue(value, unit)}
      </Typography>
    </Card>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  unit: PropTypes.string,
};

export default StatTile;
