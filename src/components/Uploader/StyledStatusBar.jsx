import React from "react";
import Box from "@mui/material/Box";
import StatusBar from "@uppy/react/lib/StatusBar";

export const StyledStatusBar = ({ theme, ...props }) => (
  <Box sx={{
    "& .uppy-StatusBar": {
      backgroundColor: theme.palette.background.paper,
    },
  }}>
    <StatusBar {...props} />
  </Box>
);
