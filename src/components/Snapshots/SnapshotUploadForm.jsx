import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StepContent, Stepper, Typography, Box, StepLabel, Step, Paper, Button, TextField } from '@mui/material';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { Uppy } from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import { StyledDragDrop } from '../Uploader/StyledDragDrop';
import { StyledStatusBar } from '../Uploader/StyledStatusBar';

import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';

export const SnapshotUploadForm = ({ onSubmit, onComplete, sx }) => {
  const { client: qdrantClient } = useClient();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);

  const [collectionName, setCollectionName] = useState('');
  const [formError, setFormError] = useState(false);
  const textFieldRef = useRef(null);
  const collectionNameRegex = /^[a-zA-Z0-9()*_\-!#$%&]*$/;
  const MAX_COLLECTION_NAME_LENGTH = 255;

  /**
   * Get the endpoint URL for uploading a snapshot, based on the collection name.
   * qdrantClient._restUri is the base URL for the API
   * @type {function(): string}
   */
  const getEndpointUrl = useCallback(() => {
    return new URL(`/collections/${collectionName}/snapshots/upload`, qdrantClient._restUri).href;
  }, [collectionName, qdrantClient]);

  /* initialize uploader, docs: https://uppy.io/docs/uppy/ */
  const uppy = useMemo(() => {
    const instance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ['application/x-tar', '.snapshot'],
      },
      autoProceed: true,
    });

    /* add XHR plugin to uploader, docs: https://uppy.io/docs/xhr-upload/ */
    instance.use(XHR, {
      id: 'XHRUpload',
      endpoint: getEndpointUrl(),
      formData: true,
      fieldName: 'snapshot',
      getResponseError: (responseText) => {
        enqueueSnackbar(JSON.parse(responseText)?.status?.error, {
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
      },
    });

    return instance;
  }, [getEndpointUrl, enqueueSnackbar, closeSnackbar]);

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
    const hasForbiddenSymbols = !collectionNameRegex.test(newCollectionName);
    const isTooShort = newCollectionName?.length < 1;
    const isTooLong = newCollectionName?.length > MAX_COLLECTION_NAME_LENGTH;

    setCollectionName(newCollectionName);
    setFormError(isTooShort || isTooLong || hasForbiddenSymbols);
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
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1 start - enter a collection name*/}
        <Step key={'Step 1 - enter a collection name'}>
          <StepLabel>Step 1 - Enter a collection name</StepLabel>
          <StepContent>
            <Typography mb={2}>Can be new or existing</Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                error={formError}
                id="collection-name"
                label="Collection Name"
                value={collectionName}
                helperText={formError ? 'This collection name is not valid' : ' '}
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
          <StepLabel>Step 2 - Upload a snapshot file</StepLabel>
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
