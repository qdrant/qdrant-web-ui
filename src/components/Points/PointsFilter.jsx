import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Chip, Grid } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import { Filter, Route } from 'lucide-react';

const StyledAutocompletePopper = styled(Popper)(() => ({
  width: 'fit-content !important',
  maxWidth: '80vw',
  '& .MuiAutocomplete-paper': {
    maxHeight: 240,
  },
  '& .MuiAutocomplete-listbox': {
    maxHeight: 220,
  },
}));

const AutocompletePopper = React.forwardRef(function AutocompletePopper(props, ref) {
  const { anchorEl, style, ...other } = props;
  const inputElement = anchorEl?.querySelector('input');
  const resolvedAnchorEl = inputElement || anchorEl;

  return <StyledAutocompletePopper {...other} ref={ref} anchorEl={resolvedAnchorEl} style={style} />;
});

// todo:
// - [ ] refactor for better readability and maintainability
// - [ ] fix the whole page re-render when the filter is changed
// - [ ] optimize the performance of the filter
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

  const sharedTextFieldSx = useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        padding: '6px 8px',
        minHeight: 40,
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '& .MuiChip-root': {
        height: 28,
        borderRadius: '8px',
      },
    }),
    [theme.palette.divider, theme.palette.primary.main]
  );

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

  const parseSimilarInput = (rawInput) => {
    const trimmedInput = (rawInput || '').trim();
    if (!trimmedInput) {
      return null;
    }

    const idMatch = trimmedInput.match(/^id\s*:\s*(.+)$/i);
    const valuePart = (idMatch ? idMatch[1] : trimmedInput).trim();
    if (!valuePart) {
      return null;
    }

    // try to coerce numeric ids while preserving strings with non-numeric chars
    const numericLike = valuePart.match(/^-?\d+(\.\d+)?$/) ? Number(valuePart) : valuePart;
    return numericLike;
  };

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

  const removeCondition = (conditionToDelete) => {
    const next = conditions.filter((condition) => !isSameCondition(condition, conditionToDelete));
    onConditionChange(next);
  };

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
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
            PopperComponent={AutocompletePopper}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 4],
                    },
                  },
                ],
              },
            }}
            value={similarConditions.map((condition) => getConditionLabel(condition))}
            inputValue={similarValue}
            onInputChange={(_event, newInputValue) => setSimilarValue(newInputValue)}
            onChange={(_event, newValues) => {
              const parsedConditions = newValues
                .map((value) => parseSimilarInput(value))
                .filter((v) => v !== null && v !== undefined)
                .map((value) => ({ key: 'id', type: 'id', value }));

              const next = uniqConditions([...parsedConditions, ...payloadConditions]);
              onConditionChange(next);
              setSimilarValue('');
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
                    const parsed = parseSimilarInput(option);
                    if (parsed === null || parsed === undefined) {
                      return;
                    }
                    removeCondition({ key: 'id', type: 'id', value: parsed });
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Similar to (id)"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Route size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
                sx={sharedTextFieldSx}
              />
            )}
          />
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
            PopperComponent={AutocompletePopper}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 4],
                    },
                  },
                ],
              },
            }}
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
                  ...sharedTextFieldSx,
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

AutocompletePopper.propTypes = {
  anchorEl: PropTypes.shape({
    getBoundingClientRect: PropTypes.func,
    querySelector: PropTypes.func,
  }),
  style: PropTypes.object,
};

export default PointsFilter;
