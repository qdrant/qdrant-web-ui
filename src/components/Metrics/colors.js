// Series colors for the Metrics charts, drawn from the MUI theme's semantic
// palette so they match the rest of the app and adapt to light/dark mode.
export const seriesPalette = (theme) => [
  theme.palette.primary,
  theme.palette.error,
  theme.palette.success,
  theme.palette.warning,
  theme.palette.secondary,
  theme.palette.info,
];

export const seriesColor = (theme, index) => {
  const palette = seriesPalette(theme);
  return palette[index % palette.length];
};
