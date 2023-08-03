import { alpha } from "@mui/material";

const background = {
  paper: '#252525',
};

const getVariant = ({ theme, ownerState }) => {
  if (ownerState?.variant === "dual") {
    return {
      backgroundColor: background.paper,
    }
  }
  if (ownerState?.variant === "heading") {
    return {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
  }
};

// these options override the base dark theme
export const darkThemeOptions = {
  components: {
    MuiCard: {
      styleOverrides: {
        // this adds variant="dual" support to the Card and the Paper component
        // dual cards have a white background and a 1px border around them
        // in the light theme (alike variant="outlined" cards)
        // and a dark background and no border in the dark theme
        // (alike variant="elevation" elevation={1} cards)
        root: getVariant,
      },
    },
    MuiPaper: {
      styleOverrides: {
        // this adds variant="heading" support to the Card and the Paper component
        root: getVariant,
      },
    },
  },
};
