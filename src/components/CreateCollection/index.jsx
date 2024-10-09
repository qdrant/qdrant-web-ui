import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Add } from '@mui/icons-material';
import CreateCollectionForm from './CreateCollectionForm';
import { Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const CreateCollection = ({ onComplete, collections, sx }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = React.useState(false);
  const handleCreateClick = () => {
    setOpen(true);
  };

  const handleCreated = () => {
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Box sx={{ ...sx }}>
      <Tooltip title={'Create collection'} placement="left">
        <Button variant={'contained'} onClick={handleCreateClick} startIcon={<Add fontSize={'small'} />}>
          Create Collection
        </Button>
      </Tooltip>
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="Create collection dialog"
        aria-describedby="Create collection dialog"
      >
        <DialogTitle>Create Collection</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Create a new collection with a name and vector configuration. For advanced options, use the{' '}
            <Link to={'/console'}>console</Link>.
          </Alert>
          <CreateCollectionForm onComplete={onComplete} collections={collections} handleCreated={handleCreated} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// props validation
CreateCollection.propTypes = {
  onComplete: PropTypes.func,
  collections: PropTypes.array,
  sx: PropTypes.object,
};

export default CreateCollection;
