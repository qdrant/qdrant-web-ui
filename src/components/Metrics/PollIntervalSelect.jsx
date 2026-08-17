import React from 'react';
import PropTypes from 'prop-types';
import { Box, FormControl, MenuItem, Select } from '@mui/material';

// How often the dashboard polls /metrics. Kept short so the whole timeline stays
// responsive; the fastest sensible cadence is 1s (Qdrant serves point-in-time
// metrics, so polling faster gains nothing).
export const POLL_INTERVAL_OPTIONS = [
  { label: '1s', value: 1000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
];

export const DEFAULT_POLL_INTERVAL_MS = 5000;

// Picks the polling cadence. Styled to match the scope control it sits beside:
// same compact height and type scale.
function PollIntervalSelect({ value, onChange }) {
  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 120,
        // One theme-radius unit (4px), matching the scope toggle beside it and
        // overriding the app's larger default select radius.
        '& .MuiOutlinedInput-root': { borderRadius: 1 },
        '& .MuiSelect-select': { py: '7.5px', minHeight: 'auto', fontSize: '0.8125rem', lineHeight: 1.4 },
      }}
    >
      <Select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Polling interval"
        renderValue={(v) => (
          <Box component="span">
            <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
              Every
            </Box>
            {(POLL_INTERVAL_OPTIONS.find((o) => o.value === v) || { label: `${v / 1000}s` }).label}
          </Box>
        )}
      >
        {POLL_INTERVAL_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

PollIntervalSelect.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PollIntervalSelect;
