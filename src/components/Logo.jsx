import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { getFullPath } from '../lib/common-helpers';

const COMPACT_HEIGHT = 28;
const COMPACT_WIDTH = (56 / 64) * COMPACT_HEIGHT;

export const Logo = ({ compact = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const logoFile = isDark ? 'logo-red-white.svg' : 'logo-red-black.svg';
  const logoUrl = getFullPath(logoFile);

  if (compact) {
    return (
      <img
        src={logoUrl}
        alt="logo"
        width={COMPACT_WIDTH}
        height={COMPACT_HEIGHT}
        style={{ objectFit: 'cover', objectPosition: 'left', flexShrink: 0 }}
      />
    );
  }

  return <img src={logoUrl} alt="logo" width="100px" />;
};

Logo.propTypes = {
  compact: PropTypes.bool,
};
