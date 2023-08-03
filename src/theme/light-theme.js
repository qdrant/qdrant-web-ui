import { alpha } from "@mui/material";

const getVariant = ({ theme, ownerState }) => {
  // this adds variant="dual" support to the Card component
  // dual cards have a white background and a 1px border around them
  // in the light theme (alike variant="outlined" cards)
  // and a dark background and no border in the dark theme
  // (alike variant="elevation" elevation={1} cards)
  if (ownerState?.variant === "dual") {
    return {
      border: `1px solid ${theme.palette.divider}`,
    }
  }
  if (ownerState?.variant === "heading") {
    return {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
  }
}

// these options override the base light theme
export const lightThemeOptions = {
  components: {
    MuiCard: {
      styleOverrides: {
        // this adds variant="dual" and variant="heading" support
        // to the Card component
        root: getVariant,
      },
    },
    MuiPaper: {
      styleOverrides: {
        // this adds variant="dual" and variant="heading" support
        // to the Paper component
        root: getVariant,
      },
    },
  },
};
