import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import UploadFile from '@mui/icons-material/UploadFile';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SnapshotUploadForm } from './SnapshotUploadForm';

export const SnapshotsUpload = ({ onComplete, sx }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
      <Tooltip title={'Upload snapshot'} placement="left">
        <IconButton variant="contained" onClick={handleUploadClick} color={'primary'}>
          <UploadFile />
        </IconButton>
      </Tooltip>
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="Snapshot upload dialog"
        aria-describedby="Snapshot upload dialog"
      >
        <DialogTitle>Upload a Snapshot</DialogTitle>
        <DialogContent>
          <SnapshotUploadForm onSubmit={handleUpload} onComplete={onComplete} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// props validation
SnapshotsUpload.propTypes = {
  onComplete: PropTypes.func,
  sx: PropTypes.object,
};
