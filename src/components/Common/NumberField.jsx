import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { ChevronUp, ChevronDown } from 'lucide-react';

// A numeric input built on Base UI's NumberField, styled to match the app's
// MUI outlined inputs. Supports an optional suffix (e.g. "%") and up/down
// stepper buttons. Values are real numbers (`null` when empty), with min/max
// clamping and keyboard/scroll stepping handled by Base UI.

const resolveBorder = (theme) => theme.palette.inputOutlinedEnabledBorder ?? theme.palette.divider;

const Group = styled(BaseNumberField.Group)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  borderRadius: '0.5rem',
  border: `1px solid ${resolveBorder(theme)}`,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    borderColor: theme.palette.inputOutlinedHoverBorder ?? theme.palette.text.primary,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  '&[data-disabled]': {
    backgroundColor: 'transparent',
    borderColor: theme.palette.action.disabledBackground,
    '&:hover': {
      borderColor: theme.palette.action.disabledBackground,
    },
  },
}));

const Input = styled(BaseNumberField.Input)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  border: 0,
  outline: 0,
  background: 'transparent',
  color: theme.palette.text.primary,
  font: 'inherit',
  fontSize: '1rem',
  lineHeight: 1.4375,
  padding: '8.5px 12px',
  MozAppearance: 'textfield',
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '&::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  '&:disabled': {
    color: theme.palette.text.disabled,
    WebkitTextFillColor: theme.palette.text.disabled,
  },
}));

const Suffix = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  paddingRight: 12,
  color: theme.palette.text.secondary,
  fontSize: '0.9375rem',
  pointerEvents: 'none',
}));

const Steppers = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  borderLeft: `1px solid ${resolveBorder(theme)}`,
}));

const stepButton = ({ theme }) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
  '&:disabled': {
    opacity: 0.4,
    cursor: 'default',
    backgroundColor: 'transparent',
  },
});

const IncrementButton = styled(BaseNumberField.Increment)(({ theme }) => ({
  ...stepButton({ theme }),
  borderBottom: `1px solid ${resolveBorder(theme)}`,
}));

const DecrementButton = styled(BaseNumberField.Decrement)(stepButton);

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
  showSteppers = true,
  sx,
}) {
  return (
    <BaseNumberField.Root
      id={id}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      style={{ width: '100%' }}
    >
      <Group sx={sx}>
        <Input placeholder={placeholder} aria-label={ariaLabel} style={suffix ? { textAlign: 'right' } : undefined} />
        {suffix ? <Suffix>{suffix}</Suffix> : null}
        {showSteppers ? (
          <Steppers>
            <IncrementButton aria-label="Increase value">
              <ChevronUp size={14} />
            </IncrementButton>
            <DecrementButton aria-label="Decrease value">
              <ChevronDown size={14} />
            </DecrementButton>
          </Steppers>
        ) : null}
      </Group>
    </BaseNumberField.Root>
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
  showSteppers: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export default NumberField;
