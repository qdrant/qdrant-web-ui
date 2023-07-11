import React from "react";
import PropTypes from "prop-types";
import { Box, Tooltip } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { SnapshotUploadForm } from "./SnapshotUploadForm";
import { UploadFile } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export const SnapshotsUpload = ({ sx }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);
  const handleUploadClick = () => {
    setOpen(true);
  };

  const handleUpload = () => {
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Box sx={{ ...sx }}>
      <Tooltip title={"Upload snapshot"} placement="left">
        <IconButton variant="contained" onClick={handleUploadClick}
                    color={"primary"}><UploadFile/></IconButton>
      </Tooltip>
      <Dialog
        fullScreen={fullScreen} fullWidth={true} maxWidth={"md"}
        open={open} onClose={() => setOpen(false)}
        aria-labelledby="Snapshot upload dialog"
        aria-describedby="Snapshot upload dialog"
      >
        <DialogTitle>Upload A Snapshot</DialogTitle>
        <DialogContent>
          <SnapshotUploadForm onSubmit={handleUpload}/>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// props validation
SnapshotsUpload.propTypes = {
  sx: PropTypes.object,
};