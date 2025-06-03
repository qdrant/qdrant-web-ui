import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import CreateCollectionDialog from './CreateCollectionDialog';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../../context/client-context';

const CreateCollectionButton = () => {
  const [open, setOpen] = useState(false);
  const { isRestricted } = useClient();

  const handleClose = () => {
    if (!isRestricted) {
      setOpen(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Tooltip
        title={
          isRestricted
            ? 'Access Denied: You do not have permission to create collections. ' + 'Please contact your administrator.'
            : 'Create collection'
        }
        placement="left"
      >
        <span>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize={'small'} />}
            onClick={handleOpen}
            disabled={isRestricted}
          >
            Create Collection
          </Button>
        </span>
      </Tooltip>
      <CreateCollectionDialog open={open} handleClose={handleClose} />
    </>
  );
};

export default CreateCollectionButton;
