import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { getFullPath } from '../lib/common-helpers';

export const Logo = ({ width, height }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const logoFile = isDark ? 'logo-red-white.svg' : 'logo-red-black.svg';
  const logoUrl = getFullPath(logoFile);

  // If height is given let the browser auto-calculate width (preserves aspect ratio).
  // If neither is given, fall back to a sensible default width.
  const imgWidth = height ? undefined : width ?? 120;

  return <img src={logoUrl} alt="logo" width={imgWidth} height={height} style={{ display: 'block' }} />;
};

Logo.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};