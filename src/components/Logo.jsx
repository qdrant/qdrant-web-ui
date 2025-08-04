import React from 'react';
import { useTheme } from '@mui/material/styles';

export const Logo = () => {
  const theme = useTheme();
  const baseUrl = import.meta.env.BASE_URL;
  const isDark = theme.palette.mode === 'dark';
  const logoFile = isDark ? '/logo-red-white.svg' : '/logo-red-black.svg';
  const joinPath = (base, path) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const logoUrl = baseUrl && baseUrl !== '/' ? joinPath(baseUrl, logoFile) : logoFile;

  return <img src={logoUrl} alt="logo" width="100px" />;
};
