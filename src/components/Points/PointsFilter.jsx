import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, InputBase } from '@mui/material';
import { Filter, Route } from 'lucide-react';

const PointsFilter = ({ onConditionChange, conditions = [], payloadSchema = {} }) => {
  const theme = useTheme();
  const [similarValue, setSimilarValue] = useState('');
  const [payloadValue, setPayloadValue] = useState('');

  const similarConditions = useMemo(() => conditions.filter((condition) => condition.type === 'id'), [conditions]);

  const payloadConditions = useMemo(() => conditions.filter((condition) => condition.type === 'payload'), [conditions]);

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

  const addPayload = () => {
    const parsed = parsePayloadInput(payloadValue);
    if (!parsed) {
      return;
    }
    const next = uniqConditions([
      ...similarConditions,
      ...payloadConditions,
      { key: parsed.key, type: 'payload', value: parsed.value },
    ]);
    onConditionChange(next);
    setPayloadValue('');
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
              borderRadius: 1,
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              px: 1,
              py: 0.75,
              minHeight: 40,
            }}
          >
            <Filter size={16} color={theme.palette.text.secondary} />
            {payloadConditions.map((condition) => (
              <Chip
                key={`${condition.key}_${condition.value}`}
                color="primary"
                size="small"
                label={getConditionLabel(condition)}
                onDelete={() => removeCondition(condition)}
              />
            ))}
            <InputBase
              value={payloadValue}
              onChange={(e) => setPayloadValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPayload();
                }
              }}
              placeholder="Filter by payload (key:value)"
              sx={{
                flex: 1,
                minWidth: 120,
                fontSize: '0.875rem',
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

PointsFilter.propTypes = {
  conditions: PropTypes.array,
  payloadSchema: PropTypes.object,
  onConditionChange: PropTypes.func.isRequired,
};

export default PointsFilter;
