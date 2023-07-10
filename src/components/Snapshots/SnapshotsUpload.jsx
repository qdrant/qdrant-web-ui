import React from "react";
import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { SnapshotUploadForm } from "./SnapshotUploadForm";

export const SnapshotsUpload = ({ sx }) => {
  const [open, setOpen] = React.useState(false);
  const handleUploadClick = () => {
    setOpen(true);
  };

  return (
    <Box sx={{ ...sx }}>
      <Button variant="contained" onClick={handleUploadClick}>Upload
        Snapshot</Button>
      <Dialog open={open} onClose={() => setOpen(false)}
              aria-labelledby="File upload dialog"
              aria-describedby="File upload dialog"
      >
        <SnapshotUploadForm onSubmit={() => setOpen(false)}/>
      </Dialog>
    </Box>
  );
};

// props validation
SnapshotsUpload.propTypes = {
  sx: PropTypes.object,
};