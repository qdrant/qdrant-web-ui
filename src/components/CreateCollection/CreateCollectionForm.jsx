import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StepContent, Stepper, Typography, Box, StepLabel, Step, Paper, Button, TextField } from '@mui/material';
import VectorConfig from './VectorConfig';
import { useClient } from '../../context/client-context';

const CreateCollectionForm = ({ collections, onComplete, sx, handleCreated }) => {
  const { client: qdrantClient } = useClient();
  const [activeStep, setActiveStep] = useState(0);
  const [collectionName, setCollectionName] = useState('');
  const [vectors, setVectors] = useState([
    { dimension: '', distance: '', name: '', multivector_config: null, sparse_vectors: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (activeStep === 2) {
      setLoading(true);
      const sparseVectors = vectors.filter((vector) => vector.sparse_vectors);
      const denseVectors = vectors.filter((vector) => !vector.sparse_vectors);

      const vectorConfig =
        denseVectors.length === 1
          ? {
              vectors: {
                size: parseInt(denseVectors[0].dimension),
                distance: denseVectors[0].distance,
                multivector_config: denseVectors[0].multivector_config,
              },
            }
          : {
              vectors: denseVectors.reduce((config, vector) => {
                config[vector.name] = {
                  size: parseInt(vector.dimension),
                  distance: vector.distance,
                  multivector_config: vector.multivector_config,
                };
                return config;
              }, {}),
            };
      vectorConfig.sparse_vectors = sparseVectors.reduce((sparseConfig, vector) => {
        sparseConfig[vector.name] = {};
        return sparseConfig;
      }, {});

      qdrantClient
        .createCollection(collectionName, vectorConfig)
        .then(() => {
          setLoading(false);
          setError(null);
          onComplete();
          handleCreated();
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
        });
    }
  }, [activeStep]);

  return (
    <Box sx={{ ...sx }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step key={'Step 1 - enter a collection name'}>
          <StepLabel>{activeStep === 0 ? 'Enter a collection name' : `Collection name: ${collectionName}`}</StepLabel>
          <CollectionNameTextBox
            collectionName={collectionName}
            setCollectionName={setCollectionName}
            collections={collections}
            handleNext={handleNext}
            activeStep={activeStep}
          />
        </Step>
        <Step key={'Step 2 - vector config'}>
          <StepLabel>Step 2 - Vector config</StepLabel>
          <VectorConfig handleNext={handleNext} handleBack={handleBack} vectors={vectors} setVectors={setVectors} />
        </Step>
      </Stepper>
      {activeStep === 2 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          {loading ? (
            <Typography>Creating collection...</Typography>
          ) : error ? (
            <Typography color="error">{error.message}</Typography>
          ) : (
            <Typography>Collection created successfully 🎉</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

// props validation
CreateCollectionForm.propTypes = {
  collections: PropTypes.array,
  onComplete: PropTypes.func.isRequired,
  sx: PropTypes.object,
  handleCreated: PropTypes.func,
};

export default CreateCollectionForm;

const CollectionNameTextBox = ({ collectionName, setCollectionName, collections, handleNext, activeStep }) => {
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

  function collectionExists(name) {
    if (collections?.some((collection) => collection.name === name)) {
      return `Collection with name "${name}" already exists`;
    }
    return null;
  }

  const MAX_COLLECTION_NAME_LENGTH = 255;

  useEffect(() => {
    if (activeStep === 0) {
      textFieldRef.current.focus();
    }
    return () => {};
  }, [activeStep]);

  const handleTextChange = (event) => {
    // if there will be more forms use schema validation instead
    const newCollectionName = event.target.value;
    const hasForbiddenSymbolsMessage = validateCollectionName(newCollectionName);
    const hasForbiddenSymbols = hasForbiddenSymbolsMessage !== null;
    const collectionExistsMessage = collectionExists(newCollectionName);
    const collectionExistsError = collectionExistsMessage !== null;
    const isTooShort = newCollectionName?.length < 1;
    const isTooLong = newCollectionName?.length > MAX_COLLECTION_NAME_LENGTH;

    setCollectionName(newCollectionName);
    setFormError(isTooShort || isTooLong || hasForbiddenSymbols || collectionExistsError);
    setFormMessage(
      isTooShort
        ? 'Collection name is too short'
        : isTooLong
        ? 'Collection name is too long'
        : (hasForbiddenSymbolsMessage || collectionExistsMessage) ?? ''
    );
  };

  return (
    <StepContent>
      <Box sx={{ mb: 2 }}>
        <Typography mb={2}>Collection name must be new</Typography>
        <TextField
          inputRef={textFieldRef}
          label="Collection name"
          variant="outlined"
          value={collectionName}
          onChange={handleTextChange}
          error={formError}
          helperText={formMessage}
          fullWidth
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }} disabled={!collectionName || formError}>
          Continue
        </Button>
      </Box>
    </StepContent>
  );
};

CollectionNameTextBox.propTypes = {
  collectionName: PropTypes.string.isRequired,
  setCollectionName: PropTypes.func.isRequired,
  collections: PropTypes.array,
  handleNext: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
};
