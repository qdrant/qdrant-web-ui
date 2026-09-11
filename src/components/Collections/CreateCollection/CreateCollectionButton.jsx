import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Link } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../../context/client-context';

const BUTTON_LABEL = 'Create Collection';

const CreateCollectionButton = () => {
  const { isRestricted } = useClient();

  if (isRestricted) {
    return (
      <Tooltip
        title="Access Denied: You do not have permission to create collections. Please contact your administrator."
        placement="bottom"
      >
        <span>
          <Button variant="contained" startIcon={<AddIcon fontSize="small" />} disabled aria-label={BUTTON_LABEL}>
            {BUTTON_LABEL}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<AddIcon fontSize="small" />}
      component={Link}
      to="/collection/create"
      aria-label={BUTTON_LABEL}
    >
      {BUTTON_LABEL}
    </Button>
  );
};

export default CreateCollectionButton;
