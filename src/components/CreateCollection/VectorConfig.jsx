import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  StepContent,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';

const VectorRow = ({ vectors, index, setVectors, errors, length, setErrors }) => {
  const [distancesOptions, setDistancesOptions] = useState([]);
  const handleAddVector = () => {
    setVectors([
      ...vectors,
      { dimension: '', distance: '', name: '', multivector_config: null, sparse_vectors: false },
    ]);
    setErrors([...errors, { dimension: '', distance: '', name: '' }]);
  };

  const handleRemoveVector = (index) => {
    const newVectors = vectors.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setVectors(newVectors);
    setErrors(newErrors);
  };

  const validate = (index, field, value) => {
    const newErrors = [...errors];
    if (!value) {
      newErrors[index][field] = `${field} is required`;
    } else if (field === 'dimension' && isNaN(value)) {
      newErrors[index][field] = 'Dimension must be a number';
    } else {
      newErrors[index][field] = '';
    }
    setErrors(newErrors);
  };

  const handleVectorChange = (index, field, value) => {
    const newVectors = [...vectors];
    newVectors[index][field] = value;
    setVectors(newVectors);
    validate(index, field, value);
  };

  const handleVectorTypeChange = (index, value) => {
    const newVectors = [...vectors];
    if (value === 'Multivector') {
      newVectors[index].multivector_config = { comparator: 'max_sim' };
      newVectors[index].sparse_vectors = false;
    } else if (value === 'Sparse') {
      newVectors[index].multivector_config = null;
      newVectors[index].sparse_vectors = true;
    } else {
      newVectors[index].multivector_config = null;
      newVectors[index].sparse_vectors = false;
    }
    setVectors(newVectors);
  };

  useEffect(() => {
    const getDistanceOptions = async () => {
      const response = await fetch(import.meta.env.BASE_URL + './openapi.json');
      const openapi = await response.json();
      setDistancesOptions(openapi.components.schemas.Distance.enum);
    };
    getDistanceOptions();
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {!vectors[index].sparse_vectors && (
        <>
          <FormControl sx={{ mr: 2, width: '150px' }} error={!!errors[index].distance}>
            <InputLabel>Distance</InputLabel>
            <Select
              value={vectors[index].distance}
              onChange={(e) => handleVectorChange(index, 'distance', e.target.value)}
              label="Distance"
            >
              {distancesOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors[index].distance}</FormHelperText>
          </FormControl>
          <TextField
            label="Dimension"
            value={vectors[index].dimension}
            onChange={(e) => handleVectorChange(index, 'dimension', e.target.value)}
            error={!!errors[index].dimension}
            helperText={errors[index].dimension}
            sx={{ mr: 2 }}
          />
        </>
      )}

      {(length > 1 || vectors[index].sparse_vectors) && (
        <TextField
          label="Name"
          value={vectors[index].name}
          onChange={(e) => handleVectorChange(index, 'name', e.target.value)}
          error={!!errors[index].name}
          helperText={errors[index].name}
          sx={{ mr: 2 }}
        />
      )}
      <FormControl sx={{ mr: 2, width: '150px' }}>
        <InputLabel>Vector Type</InputLabel>
        <Select
          value={vectors[index].multivector_config ? 'Multivector' : vectors[index].sparse_vectors ? 'Sparse' : 'Dense'}
          onChange={(e) => handleVectorTypeChange(index, e.target.value)}
          label="Vector Type"
        >
          <MenuItem value="Dense">Dense</MenuItem>
          <MenuItem value="Sparse">Sparse</MenuItem>
          <MenuItem value="Multivector">Multivector</MenuItem>
        </Select>
      </FormControl>

      {length > 1 && (
        <Tooltip title="Remove vector" placement="top">
          <IconButton onClick={() => handleRemoveVector(index)} color="error">
            <DeleteOutline />
          </IconButton>
        </Tooltip>
      )}
      {length - 1 === index && (
        <Tooltip title="Add new vector" placement="top">
          <IconButton onClick={handleAddVector} color="success">
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

VectorRow.propTypes = {
  vectors: PropTypes.array.isRequired,
  errors: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  setVectors: PropTypes.func.isRequired,
  setErrors: PropTypes.func.isRequired,
};

const VectorConfig = ({ handleNext, handleBack, vectors, setVectors }) => {
  const [errors, setErrors] = useState([{ dimension: '', distance: '', name: '' }]);

  const validateAll = () => {
    const newErrors = vectors.map((vector) => {
      const error = {};
      if (!vector.sparse_vectors) {
        if (!vector.dimension) {
          error.dimension = 'Dimension is required';
        } else if (isNaN(vector.dimension)) {
          error.dimension = 'Dimension must be a number';
        }
        if (!vector.distance) {
          error.distance = 'Distance is required';
        }
        if (vectors.length > 1 && !vector.name) {
          error.name = 'Vector name is required';
        }
      } else {
        if (!vector.name) {
          error.name = 'Vector name is required';
        }
      }
      return error;
    });
    setErrors(newErrors);
    return newErrors.every((error) => !Object.values(error).length);
  };

  const handleContinue = () => {
    if (validateAll()) {
      handleNext();
    }
  };

  return (
    <StepContent>
      <Box sx={{ mb: 2 }}>
        {vectors.map((_, index) => (
          <VectorRow
            key={index}
            index={index}
            vectors={vectors}
            setVectors={setVectors}
            errors={errors}
            length={vectors.length}
            setErrors={setErrors}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button variant="contained" onClick={handleContinue}>
          Create collection
        </Button>
        <Button variant="text" onClick={handleBack}>
          Back
        </Button>
      </Box>
    </StepContent>
  );
};

VectorConfig.propTypes = {
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  vectors: PropTypes.array.isRequired,
  setVectors: PropTypes.func.isRequired,
};

export default VectorConfig;
