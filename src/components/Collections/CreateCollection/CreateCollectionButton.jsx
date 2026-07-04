import React, { useState, useCallback } from 'react';
import { Button, Tooltip } from '@mui/material';
import CreateCollectionDialog from './CreateCollectionDialog';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../../context/client-context';
import PropTypes from 'prop-types';

const BUTTON_LABEL = 'Create Collection';

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
      {isRestricted ? (
        <Tooltip
          title="Access Denied: You do not have permission to create collections. Please contact your administrator."
          placement="bottom"
        >
          {/* span is needed to allow tooltip on disabled button */}
          <span>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleOpen}
              disabled
              aria-label={BUTTON_LABEL}
            >
              {BUTTON_LABEL}
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={handleOpen}
          aria-label={BUTTON_LABEL}
        >
          {BUTTON_LABEL}
        </Button>
      )}
      <CreateCollectionDialog open={open} handleClose={handleClose} />
    </>
  );
};

CreateCollectionButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default CreateCollectionButton;
