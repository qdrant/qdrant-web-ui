import React, { useState, useCallback } from 'react';
import { Button, Tooltip } from '@mui/material';
import CreateCollectionDialog from './CreateCollectionDialog';
import AddIcon from '@mui/icons-material/Add';
import { useClient } from '../../../context/client-context';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const CreateCollectionButton = ({ onComplete }) => {
  const [open, setOpen] = useState(false);
  const { isRestricted } = useClient();
  const { t } = useTranslation();

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
            ? t('collections.accessDeniedCreate')
            : t('collections.createCollectionTooltip')
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
            aria-label={t('collections.createCollection')}
          >
            {t('collections.createCollection')}
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
