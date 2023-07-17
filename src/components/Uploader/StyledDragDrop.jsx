import React from "react";
import Box from "@mui/material/Box";
import DragDrop from "@uppy/react/lib/DragDrop";

export const StyledDragDrop = ({ theme, ...props }) => (
  <Box sx={{
    "& .uppy-DragDrop-container": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  }}>
    <DragDrop {...props} />
  </Box>
);
