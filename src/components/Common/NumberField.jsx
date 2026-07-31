import React from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment } from '@mui/material';

// Numeric input built on MUI's TextField. The native number spin buttons are
// hidden (WebKit/Blink expose them as pseudo-elements, Gecko via appearance),
// so the field stays clean. Values are surfaced as numbers (`null` when empty)
// and clamped to any provided min/max.

const hideSpinButtonsSx = {
  '& input[type=number]': { MozAppearance: 'textfield' },
  '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
  '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
};

const clamp = (value, min, max) => {
  let next = value;
  if (typeof min === 'number') next = Math.max(min, next);
  if (typeof max === 'number') next = Math.min(max, next);
  return next;
};

export function NumberField({
  id,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
  placeholder,
  suffix,
  ariaLabel,
  sx,
}) {
  const handleChange = (event) => {
    const raw = event.target.value;
    if (raw === '') {
      onValueChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onValueChange(clamp(parsed, min, max));
  };

  return (
    <TextField
      id={id}
      type="number"
      fullWidth
      size="small"
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      slotProps={{
        htmlInput: {
          min,
          max,
          step,
          inputMode: 'numeric',
          'aria-label': ariaLabel,
          style: suffix ? { textAlign: 'right' } : undefined,
        },
        input: suffix ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> } : undefined,
      }}
      sx={{ ...hideSpinButtonsSx, ...sx }}
    />
  );
}

NumberField.propTypes = {
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  onValueChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['any'])]),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  suffix: PropTypes.node,
  ariaLabel: PropTypes.string,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export default NumberField;
