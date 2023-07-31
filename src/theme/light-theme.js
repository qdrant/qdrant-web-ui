const divider = '#E1E1E1';

// these options override the base light theme
export const lightThemeOptions = {
  components: {
    MuiCard: {
      styleOverrides: {
        // this adds variant="dual" support to the Card component
        // dual cards have a white background and a 1px border around them
        // in the light theme (alike variant="outlined" cards)
        // and a dark background and no border in the dark theme
        // (alike variant="elevation" elevation={1} cards)
        root: ({ ownerState }) =>
          ownerState?.variant === 'dual' && {
            border: `1px solid ${divider}`,
          },
      },
    },
  },
};
