import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, TextField } from '@mui/material';
import { Check, ChevronDown, Clock } from 'lucide-react';

export const REFRESH_INTERVAL_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 5_000, label: '5s' },
  { value: 10_000, label: '10s' },
  { value: 30_000, label: '30s' },
  { value: 60_000, label: '1m' },
  { value: 300_000, label: '5m' },
];

export const MIN_REFRESH_INTERVAL_MS = 100;

const INTERVAL_UNITS = { ms: 1, s: 1000, m: 60_000, h: 3_600_000 };

/**
 * Parse a user-typed refresh interval like "45s", "2m", "500ms" or "1h".
 * A bare number is treated as seconds. Returns milliseconds, or null when invalid.
 *
 * @param {string} text - raw input from the custom interval dialog
 * @return {number|null} interval in milliseconds
 */
export const parseRefreshInterval = (text) => {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(ms|s|m|h)?\s*$/i.exec(String(text));
  if (!match) {
    return null;
  }
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  const unit = (match[2] || 's').toLowerCase();
  return Math.round(value * INTERVAL_UNITS[unit]);
};

/**
 * Render an interval in milliseconds as the shortest readable label.
 *
 * @param {number} ms - interval in milliseconds
 * @return {string} label like "30s", "2m" or "500ms"
 */
export const formatRefreshInterval = (ms) => {
  if (ms >= 3_600_000 && ms % 3_600_000 === 0) {
    return `${ms / 3_600_000}h`;
  }
  if (ms >= 60_000 && ms % 60_000 === 0) {
    return `${ms / 60_000}m`;
  }
  if (ms >= 1_000 && ms % 1_000 === 0) {
    return `${ms / 1_000}s`;
  }
  return `${ms}ms`;
};

/**
 * Header control for the collection info auto refresh interval: a compact
 * button with a preset menu and a custom interval dialog. All typing state
 * lives here so keystrokes never re-render the parent component.
 *
 * @param {Object} props - component props
 * @param {number} props.value - current interval in milliseconds (0 = off)
 * @param {Function} props.onChange - called with the new interval in ms
 * @return {JSX.Element} control with menu and dialog
 */
const AutoRefreshControl = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [customLabel, setCustomLabel] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const label = customLabel ?? (REFRESH_INTERVAL_OPTIONS.find(({ value: v }) => v === value)?.label || 'Off');

  const openCustomDialog = () => {
    setCustomInput(customLabel || formatRefreshInterval(value) || '');
    setCustomError('');
    setAnchorEl(null);
    setCustomDialogOpen(true);
  };

  const closeCustomDialog = () => {
    setCustomDialogOpen(false);
    setCustomError('');
  };

  const applyCustomInterval = () => {
    const ms = parseRefreshInterval(customInput);
    if (ms == null) {
      setCustomError('Invalid interval. Use a number with an optional unit, e.g. 45s, 2m, 500ms, 1h');
      return;
    }
    if (ms < MIN_REFRESH_INTERVAL_MS) {
      setCustomError(`Interval must be at least ${MIN_REFRESH_INTERVAL_MS}ms`);
      return;
    }
    setCustomLabel(formatRefreshInterval(ms));
    setCustomDialogOpen(false);
    setCustomInput('');
    setCustomError('');
    onChange(ms);
  };

  const selectPreset = (ms) => {
    setCustomLabel(null);
    setAnchorEl(null);
    onChange(ms);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Clock size={16} />}
        endIcon={<ChevronDown size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Auto refresh interval"
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{ py: 0.75, mb: 0.2 }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {REFRESH_INTERVAL_OPTIONS.map(({ value: optionValue, label: optionLabel }) => (
          <MenuItem
            key={optionValue}
            selected={optionValue === value && !customLabel}
            onClick={() => selectPreset(optionValue)}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            {optionLabel}
            {optionValue === value && !customLabel && <Check size={16} />}
          </MenuItem>
        ))}
        <MenuItem
          onClick={openCustomDialog}
          selected={Boolean(customLabel)}
          sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
        >
          Custom…
          {customLabel && <Check size={16} />}
        </MenuItem>
      </Menu>
      <Dialog open={customDialogOpen} onClose={closeCustomDialog} fullWidth maxWidth="xs">
        <DialogTitle>Custom refresh interval</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setCustomError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyCustomInterval();
              }
            }}
            error={Boolean(customError)}
            helperText={customError || 'Examples: 45s, 2m, 500ms, 1h (min 100ms)'}
            placeholder="e.g. 45s"
            slotProps={{
              htmlInput: { 'aria-label': 'Custom refresh interval value' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCustomDialog} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={applyCustomInterval} color="primary" variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AutoRefreshControl.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(AutoRefreshControl);
