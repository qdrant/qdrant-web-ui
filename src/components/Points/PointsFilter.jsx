import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, InputBase } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Filter, Route } from 'lucide-react';

const PointsFilter = ({ onConditionChange, conditions = [], payloadSchema = {}, points }) => {
  const theme = useTheme();
  const [similarValue, setSimilarValue] = useState('');
  const [payloadValue, setPayloadValue] = useState('');

  const similarConditions = useMemo(() => conditions.filter((condition) => condition.type === 'id'), [conditions]);

  const payloadConditions = useMemo(() => conditions.filter((condition) => condition.type === 'payload'), [conditions]);
  const payloadKeyOptions = useMemo(() => {
    const keys = new Set();
    points?.points?.forEach((point) => {
      Object.keys(point?.payload || {}).forEach((key) => keys.add(key));
    });
    Object.keys(payloadSchema || {}).forEach((key) => keys.add(key));
    return [...keys];
  }, [points, payloadSchema]);
  const payloadOptions = useMemo(() => payloadKeyOptions.map((key) => `${key}:`), [payloadKeyOptions]);
  const filter = useMemo(() => createFilterOptions(), []);

  const getConditionLabel = (condition) => {
    if (condition.type === 'id') {
      return `id: ${condition.value}`;
    }
    const readableValue = condition.value === null ? 'null' : condition.value === '' ? '(empty)' : condition.value;
    return `${condition.key}: ${readableValue}`;
  };

  const isSameCondition = (a, b) => a.key === b.key && a.type === b.type && a.value === b.value;

  const uniqConditions = (list) =>
    list.filter((item, index) => list.findIndex((candidate) => isSameCondition(candidate, item)) === index);

  const normalizeValueBySchema = (valueString, key) => {
    const schemaEntry = payloadSchema?.[key];
    if (!schemaEntry) {
      return valueString;
    }

    const dataType = schemaEntry.data_type;
    const lowered = valueString?.toString().toLowerCase();

    if (dataType === 'bool' && (lowered === 'true' || lowered === 'false')) {
      return lowered === 'true';
    }

    if ((dataType === 'integer' || dataType === 'int') && valueString !== '') {
      const numericValue = Number(valueString);
      return Number.isNaN(numericValue) ? valueString : numericValue;
    }

    if (dataType === 'float' && valueString !== '') {
      const floatValue = parseFloat(valueString);
      return Number.isNaN(floatValue) ? valueString : floatValue;
    }

    return valueString;
  };

  const parsePayloadInput = (rawInput) => {
    const trimmedInput = (rawInput || '').trim();
    if (!trimmedInput) {
      return null;
    }

    const [rawKey, ...rawValueParts] = trimmedInput.split(':');
    const key = rawKey.trim();

    if (!key) {
      return null;
    }

    const rawValue = rawValueParts.join(':').trim();

    if (rawValueParts.length === 0) {
      // no value provided – treat as empty check
      return { key, value: '' };
    }

    if (rawValue.toLowerCase() === 'null') {
      return { key, value: null };
    }

    if (rawValue === '(empty)') {
      return { key, value: '' };
    }

    const normalizedValue = normalizeValueBySchema(rawValue, key);
    return { key, value: normalizedValue };
  };

  const addSimilar = () => {
    const trimmed = similarValue.trim();
    if (!trimmed) {
      return;
    }
    const next = uniqConditions([
      ...similarConditions,
      ...payloadConditions,
      { key: 'id', type: 'id', value: trimmed },
    ]);
    onConditionChange(next);
    setSimilarValue('');
  };

  const removeCondition = (conditionToDelete) => {
    const next = conditions.filter((condition) => !isSameCondition(condition, conditionToDelete));
    onConditionChange(next);
  };

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              px: 1,
              py: 0.75,
              minHeight: 40,
            }}
          >
            <Route size={16} color={theme.palette.text.secondary} />
            {similarConditions.map((condition) => (
              <Chip
                key={`${condition.key}_${condition.value}`}
                color="primary"
                size="small"
                label={getConditionLabel(condition)}
                onDelete={() => removeCondition(condition)}
              />
            ))}
            <InputBase
              value={similarValue}
              onChange={(e) => setSimilarValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSimilar();
                }
              }}
              placeholder="Similar to (id)"
              sx={{
                flex: 1,
                minWidth: 80,
                fontSize: '0.875rem',
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Autocomplete
            multiple
            freeSolo
            options={payloadOptions}
            filterOptions={(options, state) => {
              const filtered = filter(options, state);
              if (state.inputValue !== '' && !filtered.includes(state.inputValue)) {
                filtered.unshift(state.inputValue);
              }
              return filtered;
            }}
            filterSelectedOptions
            openOnFocus
            clearOnBlur={false}
            handleHomeEndKeys
            isOptionEqualToValue={(option, value) => option === value}
            value={payloadConditions.map((condition) => getConditionLabel(condition))}
            inputValue={payloadValue}
            onInputChange={(_event, newInputValue) => setPayloadValue(newInputValue)}
            onChange={(event, newValues, reason) => {
              const lastValue = newValues[newValues.length - 1];
              if ((reason === 'selectOption' || reason === 'createOption') && lastValue && lastValue.endsWith(':')) {
                setPayloadValue(`${lastValue} `);
                return;
              }

              const parsedConditions = newValues
                .map((value) => parsePayloadInput(value))
                .filter(Boolean)
                .map((parsed) => ({ key: parsed.key, type: 'payload', value: parsed.value }));
              const next = uniqConditions([...similarConditions, ...parsedConditions]);
              onConditionChange(next);
              setPayloadValue('');
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={`${option}_${index}`}
                  label={option}
                  size="small"
                  color="primary"
                  onDelete={() => {
                    const parsed = parsePayloadInput(option);
                    if (!parsed) {
                      return;
                    }
                    removeCondition({ key: parsed.key, type: 'payload', value: parsed.value });
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Filter by payload (key:value)"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Filter size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    padding: '6px 8px',
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

PointsFilter.propTypes = {
  conditions: PropTypes.array,
  payloadSchema: PropTypes.object,
  points: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.shape({ payload: PropTypes.object })).isRequired,
  }),
  onConditionChange: PropTypes.func.isRequired,
};

export default PointsFilter;
