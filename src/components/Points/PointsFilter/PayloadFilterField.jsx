import React, { memo, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, MenuItem, ClickAwayListener } from '@mui/material';
import { Filter, X } from 'lucide-react';

import {
  FilterInputContainer,
  FilterIcon,
  ClearButton,
  StyledFilterEditor,
  FilterAutocompletePopper,
  AutocompleteList,
} from './StyledPointsFilter';
import {
  getCurrentWord,
  getCurrentWordStart,
  calculatePopperOffset,
  parseFilterString,
  buildFilterInputFromConditions,
  uniqConditions,
} from './helpers';

const PayloadFilterField = memo(function PayloadFilterField({
  payloadConditions,
  similarConditions,
  payloadSchema,
  payloadKeyOptions,
  onConditionChange,
}) {
  const theme = useTheme();
  const containerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Sync filter input when payload conditions change externally
  useEffect(() => {
    setInputValue(buildFilterInputFromConditions(payloadConditions));
  }, [payloadConditions]);

  // Get the current word at cursor position
  const currentWord = useMemo(() => getCurrentWord(inputValue, cursorPosition), [inputValue, cursorPosition]);

  // Calculate the starting position of the current word
  const currentWordStart = useMemo(() => getCurrentWordStart(inputValue, cursorPosition), [inputValue, cursorPosition]);

  // Calculate horizontal offset for autocomplete popper
  const popperOffset = useMemo(() => {
    if (!containerRef.current) return [0, 4];
    return calculatePopperOffset(inputValue, currentWordStart);
  }, [inputValue, currentWordStart]);

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

  // Auto-show/hide autocomplete based on current word (only when focused)
  useEffect(() => {
    if (!isFocused) {
      setIsAutocompleteOpen(false);
      return;
    }
    // Show autocomplete when not typing a value (no colon in current word)
    const shouldShow = !currentWord.includes(':') && payloadKeyOptions.length > 0;
    setIsAutocompleteOpen(shouldShow);
  }, [currentWord, payloadKeyOptions.length, isFocused]);

  // Syntax highlighting function
  const highlightCode = useCallback(
    (code) => {
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
    },
    [theme]
  );

  // Select autocomplete option
  const selectOption = useCallback(
    (option) => {
      const beforeCursor = inputValue.slice(0, cursorPosition);
      const afterCursor = inputValue.slice(cursorPosition);

      const wordMatch = beforeCursor.match(/(\S*)$/);
      const wordStart = wordMatch ? cursorPosition - wordMatch[1].length : cursorPosition;

      const newInputValue = inputValue.slice(0, wordStart) + option + ':' + afterCursor.replace(/^\S*/, '');
      setInputValue(newInputValue);
      setIsAutocompleteOpen(false);

      setTimeout(() => {
        const textarea = containerRef.current?.querySelector('textarea');
        if (textarea) {
          const newCursorPos = wordStart + option.length + 1;
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    },
    [inputValue, cursorPosition]
  );

  // Apply payload filters on Enter
  const handleKeyDown = useCallback(
    (event) => {
      if (isAutocompleteOpen && filteredOptions.length > 0) {
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
          selectOption(filteredOptions[highlightedIndex]);
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsAutocompleteOpen(false);
          return;
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const parsedPayloadConditions = parseFilterString(inputValue, payloadSchema);
        const uniquePayloadConditions = uniqConditions(parsedPayloadConditions);
        const next = uniqConditions([...similarConditions, ...uniquePayloadConditions]);
        onConditionChange(next);
      }
    },
    [
      inputValue,
      payloadSchema,
      onConditionChange,
      similarConditions,
      isAutocompleteOpen,
      filteredOptions,
      highlightedIndex,
      selectOption,
    ]
  );

  const handleValueChange = useCallback((newValue) => {
    setInputValue(newValue);
    setHighlightedIndex(0);
    setCursorPosition(newValue.length);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    setCursorPosition(0);
    setHighlightedIndex(0);
    // Clear payload conditions
    const next = uniqConditions([...similarConditions]);
    onConditionChange(next);
  }, [similarConditions, onConditionChange]);

  const handleClickAway = useCallback(() => {
    setIsAutocompleteOpen(false);
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleClick = useCallback(() => {
    const textarea = containerRef.current?.querySelector('textarea');
    if (textarea) {
      setTimeout(() => {
        setCursorPosition(textarea.selectionStart);
        setHighlightedIndex(0);
      }, 0);
    }
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        <FilterInputContainer ref={containerRef}>
          <FilterIcon>
            <Filter size={16} />
          </FilterIcon>
          <StyledFilterEditor
            value={inputValue}
            onValueChange={handleValueChange}
            highlight={highlightCode}
            placeholder="Filter by payload (key:value key:value)"
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            padding={0}
          />
          {inputValue && (
            <ClearButton onClick={handleClear} size="small" title="Clear filter">
              <X size={18} />
            </ClearButton>
          )}
        </FilterInputContainer>
        <FilterAutocompletePopper
          open={isAutocompleteOpen && filteredOptions.length > 0}
          anchorEl={containerRef.current}
          placement="bottom-start"
          modifiers={[{ name: 'offset', options: { offset: popperOffset } }]}
        >
          <AutocompleteList>
            {filteredOptions.map((option, index) => (
              <MenuItem
                key={option}
                selected={index === highlightedIndex}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option}
              </MenuItem>
            ))}
          </AutocompleteList>
        </FilterAutocompletePopper>
      </Box>
    </ClickAwayListener>
  );
});

PayloadFilterField.propTypes = {
  payloadConditions: PropTypes.array.isRequired,
  similarConditions: PropTypes.array.isRequired,
  payloadSchema: PropTypes.object,
  payloadKeyOptions: PropTypes.array.isRequired,
  onConditionChange: PropTypes.func.isRequired,
};

export default PayloadFilterField;
