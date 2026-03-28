import React from 'react';
import { useTheme } from '@mui/material/styles';
import { getFullPath } from '../lib/common-helpers';

export const Logo = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const logoFile = isDark ? 'logo-red-white.svg' : 'logo-red-black.svg';
  const logoUrl = getFullPath(logoFile);

  return <img src={logoUrl} alt="logo" width="100px" />;
};
