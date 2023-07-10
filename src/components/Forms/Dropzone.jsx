import { useDropzone } from "react-dropzone";
import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/system";

export const Dropzone = function({ onDrop, options, sx }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(
    { onDrop, ...options });
  return (
    <Box {...getRootProps()} sx={{ ...sx }}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </Box>
  );
}

Dropzone.propTypes = {
  onDrop: PropTypes.func.isRequired,
  options: PropTypes.object,
  sx: PropTypes.object,
}
