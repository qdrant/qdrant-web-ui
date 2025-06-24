import React, { useState, useCallback } from 'react';
import { Button, Tooltip } from '@mui/material';
import CreateCollectionDialog from './CreateCollectionDialog';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../../context/client-context';
import PropTypes from 'prop-types';

const CreateCollectionButton = ({ onComplete }) => {
  const [open, setOpen] = useState(false);
  const { isRestricted } = useClient();

  const handleClose = useCallback(() => {
    setOpen(false);
    onComplete();
  }, [onComplete]);

  const handleOpen = useCallback(() => {
    if (!isRestricted) {
      setOpen(true);
    }
  }, [isRestricted]);

  return (
    <>
      <Tooltip
        title={
          isRestricted
            ? 'Access Denied: You do not have permission to create collections. Please contact your administrator.'
            : 'Create collection'
        }
        placement="left"
      >
        {/* span is needed to allow tooltip on disabled button */}
        <span>
          <Button
            variant="contained"
            startIcon={<AddIcon fontSize="small" />}
            onClick={handleOpen}
            disabled={isRestricted}
            aria-label="Create Collection"
          >
            Create Collection
          </Button>
        </span>
      </Tooltip>
      <CreateCollectionDialog open={open} handleClose={handleClose} />
    </>
  );
};

CreateCollectionButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default CreateCollectionButton;
