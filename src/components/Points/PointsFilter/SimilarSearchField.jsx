import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Chip, Tooltip } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Route } from 'lucide-react';

import { StyledAutocompletePopper, getSharedTextFieldSx } from './StyledPointsFilter';
import { getSimilarConditionLabel, parseSimilarInput, isSameCondition, uniqConditions } from './helpers';

const MAX_VISIBLE_CHIPS = 2;

const SimilarAutocompletePopper = React.forwardRef(function SimilarAutocompletePopper(props, ref) {
  const { anchorEl, style, ...other } = props;
  const inputElement = anchorEl?.querySelector('input');
  const resolvedAnchorEl = inputElement || anchorEl;

  return <StyledAutocompletePopper {...other} ref={ref} anchorEl={resolvedAnchorEl} style={style} />;
});

SimilarAutocompletePopper.propTypes = {
  anchorEl: PropTypes.shape({
    getBoundingClientRect: PropTypes.func,
    querySelector: PropTypes.func,
  }),
  style: PropTypes.object,
};

const filter = createFilterOptions();

const SimilarSearchField = memo(function SimilarSearchField({
  similarConditions,
  payloadConditions,
  onConditionChange,
  isExpanded,
  onExpandChange,
}) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  const sharedTextFieldSx = useMemo(() => getSharedTextFieldSx(theme), [theme]);

  const conditionLabels = useMemo(
    () => similarConditions.map((condition) => getSimilarConditionLabel(condition)),
    [similarConditions]
  );

  // Auto-expand/collapse based on chip count
  useEffect(() => {
    if (conditionLabels.length === 0) {
      onExpandChange(false);
    } else if (conditionLabels.length > MAX_VISIBLE_CHIPS) {
      onExpandChange(true);
    } else if (conditionLabels.length <= MAX_VISIBLE_CHIPS) {
      onExpandChange(false);
    }
  }, [conditionLabels.length, onExpandChange]);

  const visibleChipsCount = isExpanded ? conditionLabels.length : Math.min(MAX_VISIBLE_CHIPS, conditionLabels.length);

  const removeCondition = useCallback(
    (conditionToDelete) => {
      const next = [...similarConditions, ...payloadConditions].filter(
        (condition) => !isSameCondition(condition, conditionToDelete)
      );
      onConditionChange(next);
    },
    [similarConditions, payloadConditions, onConditionChange]
  );

  const handleChipEdit = useCallback(
    (event, option) => {
      if (event?.target?.closest?.('.MuiChip-deleteIcon')) {
        return;
      }
      const parsed = parseSimilarInput(option);
      if (parsed === null || parsed === undefined) {
        return;
      }
      removeCondition({ key: 'id', type: 'id', value: parsed });
      setInputValue(option);
    },
    [removeCondition]
  );

  const handleBackspaceEdit = useCallback(
    (event) => {
      if (event.key !== 'Backspace' || inputValue) {
        return;
      }

      const lastCondition = similarConditions[similarConditions.length - 1];
      if (!lastCondition) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const label = getSimilarConditionLabel(lastCondition);
      removeCondition(lastCondition);
      setInputValue(label);
    },
    [inputValue, similarConditions, removeCondition]
  );

  const handleInputChange = useCallback((_event, newInputValue) => {
    setInputValue(newInputValue);
  }, []);

  const handleChange = useCallback(
    (_event, newValues) => {
      const parsedConditions = newValues
        .map((value) => parseSimilarInput(value))
        .filter((v) => v !== null && v !== undefined)
        .map((value) => ({ key: 'id', type: 'id', value }));

      const next = uniqConditions([...parsedConditions, ...payloadConditions]);
      onConditionChange(next);
      setInputValue('');
    },
    [payloadConditions, onConditionChange]
  );

  const handleDeleteChip = useCallback(
    (option) => {
      const parsed = parseSimilarInput(option);
      if (parsed === null || parsed === undefined) {
        return;
      }
      removeCondition({ key: 'id', type: 'id', value: parsed });
    },
    [removeCondition]
  );

  const renderChips = useCallback(
    (selected) => {
      const visibleChips = selected.slice(0, visibleChipsCount);
      return visibleChips.map((option, index) => {
        const fullLabel = option;
        const shouldTruncate = !isExpanded && fullLabel.length > 15;
        const displayLabel = shouldTruncate ? `${fullLabel.slice(0, 12)}...` : fullLabel;
        const hasMaxWidth = !isExpanded;
        const showTooltip = shouldTruncate || (hasMaxWidth && fullLabel.length > 0);

        const chip = (
          <Chip
            label={displayLabel}
            size="small"
            sx={{
              maxHeight: '24px !important',
              marginRight: 0.5,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isExpanded ? 'none' : '100px',
              },
            }}
            color="primary"
            onClick={(event) => handleChipEdit(event, option)}
            onDelete={() => handleDeleteChip(option)}
          />
        );

        return showTooltip ? (
          <Tooltip key={`${option}_${index}`} title={fullLabel} arrow>
            <span>{chip}</span>
          </Tooltip>
        ) : (
          <span key={`${option}_${index}`}>{chip}</span>
        );
      });
    },
    [visibleChipsCount, isExpanded, handleChipEdit, handleDeleteChip]
  );

  const renderInput = useCallback(
    (params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        placeholder="Similar to (id)"
        slotProps={{
          input: {
            sx: { paddingTop: '4px !important', paddingBottom: '4px !important' },
            ...params.InputProps,
            startAdornment: (
              <>
                <Route size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                {params.InputProps.startAdornment}
              </>
            ),
            onKeyDown: handleBackspaceEdit,
          },
        }}
        sx={{
          ...sharedTextFieldSx,
          '& .MuiOutlinedInput-root': {
            ...sharedTextFieldSx['& .MuiOutlinedInput-root'],
            flexWrap: isExpanded ? 'wrap' : 'nowrap',
            overflow: isExpanded ? 'visible' : 'hidden',
          },
        }}
      />
    ),
    [theme.palette.text.secondary, sharedTextFieldSx, isExpanded, handleBackspaceEdit]
  );

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      filterOptions={(options, state) => filter(options, state)}
      filterSelectedOptions
      openOnFocus
      clearOnBlur={false}
      handleHomeEndKeys
      isOptionEqualToValue={(option, value) => option === value}
      PopperComponent={SimilarAutocompletePopper}
      slotProps={{
        popper: {
          placement: 'bottom-start',
          modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
        },
      }}
      value={conditionLabels}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      renderValue={renderChips}
      renderInput={renderInput}
    />
  );
});

SimilarSearchField.propTypes = {
  similarConditions: PropTypes.array.isRequired,
  payloadConditions: PropTypes.array.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpandChange: PropTypes.func.isRequired,
};

export default SimilarSearchField;
