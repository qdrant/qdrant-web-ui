// Series colors for the Metrics charts, drawn from the MUI theme's semantic
// palette so they match the rest of the app and adapt to light/dark mode. A
// series' chart line and its chip share the same color, assigned by position.
// Ordered to keep adjacent series visually distinct (the two blue-ish entries
// come last, so they only appear on charts with five or more series).
//
// The full palette entry is returned (not just `.main`) so consumers can use
// its ready-made `.contrastText` for legible chip labels.
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
