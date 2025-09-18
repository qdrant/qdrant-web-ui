import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StepContent, Stepper, Typography, Box, StepLabel, Step, Paper, Button, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { Uppy } from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import { StyledDragDrop } from '../Uploader/StyledDragDrop';
import { StyledStatusBar } from '../Uploader/StyledStatusBar';

import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';

const StyledStepIcon = styled(({ className, ...props }) => <div className={className} {...props} />)(
  ({ theme, active, completed, error }) => {
    let backgroundColor = theme.palette.grey[400];
    if (error) {
      backgroundColor = theme.palette.error.main;
    } else if (active || completed) {
      backgroundColor = theme.palette.primary.main;
    }

    return {
      width: 12,
      height: 12,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor,
      color: theme.palette.common.white,
      fontSize: '8px', // Smaller checkmark for 12px dot
      transition: 'all 0.2s ease-in-out',
      ...(completed && {
        '&::before': {
          content: '"✓"', // todo: do we need this?
          fontSize: '8px',
        },
      }),
    };
  }
);

export const SnapshotUploadForm = ({ onSubmit, onComplete, sx }) => {
  const { client: qdrantClient } = useClient();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);

  const [collectionName, setCollectionName] = useState('');
  const [formError, setFormError] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const textFieldRef = useRef(null);

  function validateCollectionName(value) {
    const INVALID_CHARS = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '\0', '\u{1F}'];

    const invalidChar = INVALID_CHARS.find((c) => value.includes(c));

    if (invalidChar !== undefined) {
      return `Collection name cannot contain "${invalidChar}" char`;
    } else {
      return null;
    }
  }
  const MAX_COLLECTION_NAME_LENGTH = 255;

  const getHeaders = () => {
    const apiKey = qdrantClient.getApiKey();
    return apiKey ? { 'api-key': apiKey } : {};
  };

  /* initialize uploader, docs: https://uppy.io/docs/uppy/ */
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      allowedFileTypes: ['application/x-tar', '.snapshot'],
    },
    autoProceed: true,
  });

  /* add XHR plugin to uploader, docs: https://uppy.io/docs/xhr-upload/ */
  uppy.use(XHR, {
    id: 'XHRUpload',
    endpoint: qdrantClient.getSnapshotUploadUrl(collectionName).href,
    headers: getHeaders(),
    formData: true,
    fieldName: 'snapshot',
  });

  uppy.on('upload-error', (_, error, response) => {
    const errorMessage = response?.body?.status?.error || error.message || 'Unknown error';
    enqueueSnackbar(`Upload failed: ${errorMessage}`, {
      variant: 'error',
      autoHideDuration: null,
      action: (key) => (
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            closeSnackbar(key);
          }}
        >
          Dismiss
        </Button>
      ),
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    });
  });

  uppy.on('upload-success', () => {
    handleFinish();
  });

  uppy.on('complete', (result) => {
    onSubmit();
    if (result.failed.length === 0) {
      onComplete();
    }
  });

  useEffect(() => {
    if (activeStep === 0) {
      textFieldRef.current.focus();
    }
    return () => {
      uppy.cancelAll();
    };
  }, [uppy, activeStep]);

  const handleTextChange = (event) => {
    // if there will be more forms use schema validation instead
    const newCollectionName = event.target.value;
    const hasForbiddenSymbolsMessage = validateCollectionName(newCollectionName);
    const hasForbiddenSymbols = hasForbiddenSymbolsMessage !== null;
    const isTooShort = newCollectionName?.length < 1;
    const isTooLong = newCollectionName?.length > MAX_COLLECTION_NAME_LENGTH;

    setCollectionName(newCollectionName);
    setFormError(isTooShort || isTooLong || hasForbiddenSymbols);
    setFormMessage(
      isTooShort
        ? 'Collection name is too short'
        : isTooLong
        ? 'Collection name is too long'
        : hasForbiddenSymbolsMessage
    );
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    uppy.cancelAll();
  };

  const handleFinish = () => {
    setActiveStep(3);
  };

  return (
    <Box sx={{ ...sx }}>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          '& .MuiStepConnector-root, & .MuiStepContent-root': {
            marginLeft: '0.3125rem',
          },
          '& .MuiStepLabel-root': {
            fontSize: '1rem',
            fontWeight: 400,
            marginBottom: '1rem',
          },
        }}
      >
        {/* Step 1 start - enter a collection name*/}
        <Step key={'Step 1 - enter a collection name'}>
          <StepLabel slots={{ stepIcon: StyledStepIcon }}>Step 1 - Enter a collection name</StepLabel>
          <StepContent>
            <Typography mb={2} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Can be new or existing
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                error={formError}
                id="collection-name"
                label="Collection Name"
                value={collectionName}
                helperText={formError ? formMessage : ''}
                onChange={handleTextChange}
                fullWidth={true}
                inputRef={textFieldRef}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
                disabled={!collectionName || formError}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>
        {/* Step 1 end - enter a collection name*/}

        {/* Step 2 start - upload a snapshot file*/}
        <Step key={'Step 2 - upload a snapshot file'}>
          <StepLabel slots={{ stepIcon: StyledStepIcon }}>Step 2 - Upload a snapshot file</StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              {/* Here we have a drag and drop area*/}
              <StyledDragDrop uppy={uppy} />
              <StyledStatusBar uppy={uppy} />
            </Box>
            <Box mb={2}>
              <Button variant="contained" onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>
        {/* Step 2 end - upload a snapshot file*/}
      </Stepper>
      {activeStep === 3 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished 🎉</Typography>
        </Paper>
      )}
    </Box>
  );
};

// props validation
SnapshotUploadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
