import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Grid, Paper, MenuItem, Popper, ClickAwayListener, Chip, alpha } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Editor from 'react-simple-code-editor';
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

const SimilarAutocompletePopper = React.forwardRef(function SimilarAutocompletePopper(props, ref) {
  const { anchorEl, style, ...other } = props;
  const inputElement = anchorEl?.querySelector('input');
  const resolvedAnchorEl = inputElement || anchorEl;

  return <StyledAutocompletePopper {...other} ref={ref} anchorEl={resolvedAnchorEl} style={style} />;
});

const FilterInputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  minHeight: 40,
  padding: '6px 8px',
  transition: 'border-color 0.15s ease-in-out',
  cursor: 'text',
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    padding: '5px 7px', // Compensate for thicker border
  },
}));

const FilterIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: 4,
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

const StyledFilterEditor = styled(Editor)(({ theme }) => ({
  flex: 1,
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: '23px',
  letterSpacing: '0.5px',
  '& textarea, & pre': {
    fontFamily: 'inherit !important',
    fontSize: 'inherit !important',
    fontWeight: 'inherit !important',
    lineHeight: 'inherit !important',
    letterSpacing: 'inherit !important',
    margin: '0 !important',
    padding: '0 !important',
    border: 'none !important',
    outline: 'none !important',
    background: 'transparent !important',
    whiteSpace: 'pre-wrap !important',
    wordBreak: 'break-word !important',
    wordSpacing: 'normal !important',
  },
}));

const FilterAutocompletePopper = styled(Popper)({
  zIndex: 1300,
});

const AutocompleteList = styled(Paper)(({ theme }) => ({
  maxHeight: 220,
  minWidth: 300,
  overflow: 'auto',
  marginTop: 4,
  '& .MuiMenuItem-root': {
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    padding: '4px 12px',
    minHeight: 'auto',
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// todo:
// - [ ] refactor for better readability and maintainability
// - [ ] fix the whole page re-render when the filter is changed
// - [ ] optimize the performance of the filter
// - [ ] add a clear all button to the filter input
// - [ ] should Find Similar add or replace the condition?
const PointsFilter = ({ onConditionChange, conditions = [], payloadSchema = {}, points }) => {
  const theme = useTheme();
  const filterContainerRef = useRef(null);
  const [similarValue, setSimilarValue] = useState('');
  const [filterInputValue, setFilterInputValue] = useState('');
  const [isFilterAutocompleteOpen, setIsFilterAutocompleteOpen] = useState(false);
  const [isFilterFocused, setIsFilterFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const filter = useMemo(() => createFilterOptions(), []);

  const similarConditions = useMemo(() => conditions.filter((condition) => condition.type === 'id'), [conditions]);
  const payloadConditions = useMemo(() => conditions.filter((condition) => condition.type === 'payload'), [conditions]);

  // Build filter input value from payload conditions
  const buildFilterInputFromConditions = useCallback((conditionsList) => {
    return conditionsList
      .map((condition) => {
        const readableValue = condition.value === null ? 'null' : condition.value === '' ? '(empty)' : condition.value;
        return `${condition.key}:${readableValue}`;
      })
      .join(' ');
  }, []);

  // Sync filter input when payload conditions change externally
  useEffect(() => {
    setFilterInputValue(buildFilterInputFromConditions(payloadConditions));
  }, [payloadConditions, buildFilterInputFromConditions]);

  // Extract the current word being typed for autocomplete
  const getCurrentWord = useCallback((text, cursorPos) => {
    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(/(\S+)$/);
    return match ? match[1] : '';
  }, []);

  const payloadKeyOptions = useMemo(() => {
    const keys = new Set();
    Object.keys(points?.payload_schema || {}).forEach((key) => keys.add(key));
    Object.keys(payloadSchema || {}).forEach((key) => keys.add(key));
    return [...keys];
  }, [points, payloadSchema]);

  // Get the current word at cursor position
  const currentWord = useMemo(() => {
    return getCurrentWord(filterInputValue, cursorPosition);
  }, [filterInputValue, cursorPosition, getCurrentWord]);

  // Calculate the starting position of the current word for popper positioning
  const currentWordStart = useMemo(() => {
    const beforeCursor = filterInputValue.slice(0, cursorPosition);
    const wordMatch = beforeCursor.match(/(\S*)$/);
    return wordMatch ? cursorPosition - wordMatch[1].length : cursorPosition;
  }, [filterInputValue, cursorPosition]);

  // Calculate horizontal offset for autocomplete popper (position at word start)
  const popperOffset = useMemo(() => {
    if (!filterContainerRef.current) return [0, 4];

    // Get the text before the current word
    const textBeforeWord = filterInputValue.slice(0, currentWordStart);

    // Measure the width of text before the word using a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Match the editor's font
    ctx.font = '1rem system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(textBeforeWord).width;

    // Add offset for the filter icon (approximately 24px for icon + margin)
    const iconOffset = 28;

    return [textWidth + iconOffset, 4];
  }, [filterInputValue, currentWordStart]);

  // Get filtered autocomplete options based on current input
  const filteredOptions = useMemo(() => {
    // Don't show options if already typing a value (after colon)
    if (currentWord.includes(':')) {
      return [];
    }

    // Filter options based on current word
    if (!currentWord) {
      return payloadKeyOptions;
    }

    const loweredWord = currentWord.toLowerCase();
    return payloadKeyOptions.filter((option) => option.toLowerCase().startsWith(loweredWord));
  }, [currentWord, payloadKeyOptions]);

  const normalizeValueBySchema = useCallback(
    (valueString, key) => {
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
    },
    [payloadSchema]
  );

  // Parse filter string into payload conditions array
  const parseFilterString = useCallback(
    (filterText) => {
      const tokens = filterText.match(/\S+/g) || [];
      const parsedConditions = [];

      tokens.forEach((token) => {
        const colonIndex = token.indexOf(':');
        if (colonIndex === -1) {
          return;
        }

        const key = token.slice(0, colonIndex).trim();
        const rawValue = token.slice(colonIndex + 1).trim();

        if (!key || !rawValue) {
          return;
        }

        let value;
        if (rawValue.toLowerCase() === 'null') {
          value = null;
        } else if (rawValue === '(empty)') {
          value = '';
        } else {
          value = normalizeValueBySchema(rawValue, key);
        }
        parsedConditions.push({ key, type: 'payload', value });
      });

      return parsedConditions;
    },
    [normalizeValueBySchema]
  );

  const isSameCondition = (a, b) => a.key === b.key && a.type === b.type && a.value === b.value;

  const uniqConditions = (list) =>
    list.filter((item, index) => list.findIndex((candidate) => isSameCondition(candidate, item)) === index);

  const getSimilarConditionLabel = (condition) => `id: ${condition.value}`;

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

    const numericLike = valuePart.match(/^-?\d+(\.\d+)?$/) ? Number(valuePart) : valuePart;
    return numericLike;
  };

  const removeCondition = (conditionToDelete) => {
    const next = conditions.filter((condition) => !isSameCondition(condition, conditionToDelete));
    onConditionChange(next);
  };

  const handleSimilarChipEdit = (event, option) => {
    if (event?.target?.closest?.('.MuiChip-deleteIcon')) {
      return;
    }
    const parsed = parseSimilarInput(option);
    if (parsed === null || parsed === undefined) {
      return;
    }
    removeCondition({ key: 'id', type: 'id', value: parsed });
    setSimilarValue(option);
  };

  const handleSimilarBackspaceEdit = (event) => {
    if (event.key !== 'Backspace' || similarValue) {
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
    setSimilarValue(label);
  };

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

  // Select autocomplete option for filter
  const selectFilterOption = useCallback(
    (option) => {
      const beforeCursor = filterInputValue.slice(0, cursorPosition);
      const afterCursor = filterInputValue.slice(cursorPosition);

      const wordMatch = beforeCursor.match(/(\S*)$/);
      const wordStart = wordMatch ? cursorPosition - wordMatch[1].length : cursorPosition;

      const newInputValue = filterInputValue.slice(0, wordStart) + option + ':' + afterCursor.replace(/^\S*/, '');
      setFilterInputValue(newInputValue);
      setIsFilterAutocompleteOpen(false);

      setTimeout(() => {
        const textarea = filterContainerRef.current?.querySelector('textarea');
        if (textarea) {
          const newCursorPos = wordStart + option.length + 1;
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    },
    [filterInputValue, cursorPosition]
  );

  // Apply payload filters on Enter
  const handleFilterKeyDown = useCallback(
    (event) => {
      if (isFilterAutocompleteOpen && filteredOptions.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
          return;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          selectFilterOption(filteredOptions[highlightedIndex]);
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsFilterAutocompleteOpen(false);
          return;
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const parsedPayloadConditions = parseFilterString(filterInputValue);
        const uniquePayloadConditions = uniqConditions(parsedPayloadConditions);
        const next = uniqConditions([...similarConditions, ...uniquePayloadConditions]);
        onConditionChange(next);
      }
    },
    [
      filterInputValue,
      parseFilterString,
      onConditionChange,
      similarConditions,
      isFilterAutocompleteOpen,
      filteredOptions,
      highlightedIndex,
      selectFilterOption,
    ]
  );

  // Syntax highlighting function for the filter editor
  const highlightCode = useCallback((code) => {
    if (!code) return '';

    const regex = /([a-zA-Z_][\w.]*):(\S*)/g;
    const keyColor = theme.palette.text.primary;
    const valueColor = theme.palette.primary.main;
    const valueBgColor = alpha(theme.palette.primary.light, 0.15);

    return code.replace(regex, (match, key, value) => {
      const valueSpan = value
        ? `<span style="color:${valueColor};background:${valueBgColor};border-radius:2px;padding:0;margin:0;display:inline-block">${value}</span>`
        : '';
      return `<span style="color:${keyColor};font-weight:500">${key}:</span>${valueSpan}`;
    });
  }, [theme]);

  const handleFilterValueChange = useCallback((newValue) => {
    setFilterInputValue(newValue);
    setHighlightedIndex(0);
    // Cursor position will be updated via onSelect/onClick handlers
    // For typing, assume cursor is at the end of the new value
    setCursorPosition(newValue.length);
  }, []);

  // Auto-show/hide autocomplete based on current word (only when focused)
  useEffect(() => {
    if (!isFilterFocused) {
      setIsFilterAutocompleteOpen(false);
      return;
    }
    // Show autocomplete when not typing a value (no colon in current word)
    const shouldShow = !currentWord.includes(':') && payloadKeyOptions.length > 0;
    setIsFilterAutocompleteOpen(shouldShow);
  }, [currentWord, payloadKeyOptions.length, isFilterFocused]);

  const handleFilterClickAway = useCallback(() => {
    setIsFilterAutocompleteOpen(false);
    setIsFilterFocused(false);
  }, []);

  const handleFilterFocus = useCallback(() => {
    setIsFilterFocused(true);
  }, []);

  // Update cursor position when clicking inside the editor
  const handleFilterClick = useCallback(() => {
    const textarea = filterContainerRef.current?.querySelector('textarea');
    if (textarea) {
      // Use setTimeout to get cursor position after click is processed
      setTimeout(() => {
        setCursorPosition(textarea.selectionStart);
        setHighlightedIndex(0);
      }, 0);
    }
  }, []);

  return (
    <Box>
      <Grid container spacing={1}>
        {/* Similar search field (with chips) */}
        <Grid size={{ xs: 12, md: 3 }}>
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
            value={similarConditions.map((condition) => getSimilarConditionLabel(condition))}
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
            renderValue={(selected) =>
              selected.map((option, index) => (
                <Chip
                  key={`${option}_${index}`}
                  label={option}
                  size="small"
                  sx={{
                    maxHeight: '24px !important',
                    marginRight: index < selected.length - 1 ? 0.5 : 0,
                  }}
                  color="primary"
                  onClick={(event) => handleSimilarChipEdit(event, option)}
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
                    sx: { paddingTop: '4px !important', paddingBottom: '4px !important' },
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Route size={16} color={theme.palette.text.secondary} style={{ marginRight: 4 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    onKeyDown: handleSimilarBackspaceEdit,
                  },
                }}
                sx={sharedTextFieldSx}
              />
            )}
          />
        </Grid>

        {/* Payload filter field (GitHub-style with syntax highlighting) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <ClickAwayListener onClickAway={handleFilterClickAway}>
            <Box sx={{ position: 'relative' }}>
              <FilterInputContainer ref={filterContainerRef}>
                <FilterIcon>
                  <Filter size={16} />
                </FilterIcon>
                <StyledFilterEditor
                  value={filterInputValue}
                  onValueChange={handleFilterValueChange}
                  highlight={highlightCode}
                  placeholder="Filter by payload (key:value key:value)"
                  onKeyDown={handleFilterKeyDown}
                  onFocus={handleFilterFocus}
                  onClick={handleFilterClick}
                  padding={0}
                />
              </FilterInputContainer>
              <FilterAutocompletePopper
                open={isFilterAutocompleteOpen && filteredOptions.length > 0}
                anchorEl={filterContainerRef.current}
                placement="bottom-start"
                modifiers={[{ name: 'offset', options: { offset: popperOffset } }]}
              >
                <AutocompleteList>
                  {filteredOptions.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === highlightedIndex}
                      onClick={() => selectFilterOption(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </AutocompleteList>
              </FilterAutocompletePopper>
            </Box>
          </ClickAwayListener>
        </Grid>
      </Grid>
    </Box>
  );
};

PointsFilter.propTypes = {
  conditions: PropTypes.array,
  payloadSchema: PropTypes.object,
  points: PropTypes.shape({
    payload_schema: PropTypes.object,
    points: PropTypes.arrayOf(PropTypes.shape({ payload: PropTypes.object })),
  }),
  onConditionChange: PropTypes.func.isRequired,
};

SimilarAutocompletePopper.propTypes = {
  anchorEl: PropTypes.shape({
    getBoundingClientRect: PropTypes.func,
    querySelector: PropTypes.func,
  }),
  style: PropTypes.object,
};

export default PointsFilter;
