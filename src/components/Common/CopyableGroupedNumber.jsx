import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { formatGroupedDigits } from '../../lib/common-helpers';

const GROUP_FROM = 10_000;

const shouldGroupFiniteNumber = (n) => Math.abs(n) >= GROUP_FROM;

const shouldFormatGrouped = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'bigint') {
    const limit = BigInt(GROUP_FROM);
    return value >= limit || value <= -limit;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return false;
    return shouldGroupFiniteNumber(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return shouldGroupFiniteNumber(n);
    return false;
  }
  return false;
};

const toPlainText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const CopyableGroupedNumber = ({ value, component = 'span', sx, ...rest }) => {
  const plain = toPlainText(value);
  const display = shouldFormatGrouped(value) ? formatGroupedDigits(value) : plain;

  const handleCopy = (e) => {
    e.clipboardData.setData('text/plain', plain);
    e.preventDefault();
  };

  return (
    <Box component={component} onCopy={handleCopy} sx={{ whiteSpace: 'nowrap', ...sx }} {...rest}>
      {display}
    </Box>
  );
};

CopyableGroupedNumber.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.bigint]),
  component: PropTypes.elementType,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};
