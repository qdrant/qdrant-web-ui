import React from "react";
import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";
import { DropzoneDialog } from "../../Forms/DropzoneDialog";

export const SnapshotsUpload = ({sx}) => {
  const [open, setOpen] = React.useState(false);
  const handleUploadClick = () => {
    setOpen(true);
  }

  const handleUpload = (files) => {
    console.log(files);
  }
  return (
    <Box sx={{...sx}}>
      <Button variant="contained" onClick={handleUploadClick}>Upload Snapshot</Button>
      <DropzoneDialog open={open} onClose={() => {setOpen(false)}} onDropHandler={handleUpload} />
    </Box>
  )
}

// props validation
SnapshotsUpload.propTypes = {
  sx: PropTypes.object,
}