import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import Dialog from "@mui/material/Dialog";

export const DropzoneDialog = function({open, onClose, onDropHandler }) {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    //todo: if onDropHandler is async?
    onDropHandler();
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Dialog open={open} onClose={onClose}
            aria-labelledby="File upload dialog"
            aria-describedby="File upload dialog"
    >
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
    </Dialog>
  );
};

// props validation
DropzoneDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDropHandler: PropTypes.func,
};