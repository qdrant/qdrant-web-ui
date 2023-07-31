const background = {
  paper: '#252525',
};

// these options override the base dark theme
export const darkThemeOptions = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ ownerState }) =>
          // this adds variant="dual" support to the Card component
          // dual cards have a white background and a 1px border around them
          // in the light theme (alike variant="outlined" cards)
          // and a dark background and no border in the dark theme
          // (alike variant="elevation" elevation={1} cards)
          ownerState?.variant === 'dual' && {
            backgroundColor: background.paper,
          },
      },
    },
  },
};
