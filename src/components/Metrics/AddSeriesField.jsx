import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, Box, Chip, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { seriesLabel, isCounter } from '../../lib/metrics-parser';

// Two series can share a chart only if they'd share a meaningful Y axis: the
// same display unit and the same plotting kind (gauge raw vs counter rate).
const optionCompat = (option) => `${option.unit}:${isCounter(option.type) ? 'rate' : 'raw'}`;

// eslint-disable-next-line react/prop-types
const renderOption = (props, option) => (
  // eslint-disable-next-line react/prop-types
  <Box component="li" {...props} key={option.key}>
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography variant="body2" noWrap>
        {seriesLabel(option)}
      </Typography>
      {option.help && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {option.help}
        </Typography>
      )}
    </Box>
  </Box>
);

const autocompleteProps = {
  size: 'small',
  getOptionLabel: (option) => (typeof option === 'string' ? option : option.key),
  isOptionEqualToValue: (option, selected) => option.key === selected.key,
  renderOption,
};

// Inline adder inside an existing chart: a small search field; picking a metric
// adds it immediately.
function InlineAddField({ options, onAdd, placeholder }) {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const commit = (option) => {
    if (!option) return;
    onAdd(option);
    setValue(null);
    setInputValue('');
  };

  return (
    <Autocomplete
      {...autocompleteProps}
      fullWidth
      value={value}
      onChange={(_, option) => commit(option)}
      inputValue={inputValue}
      onInputChange={(_, next) => setInputValue(next)}
      options={options}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
    />
  );
}

InlineAddField.propTypes = {
  options: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

// The top-of-dashboard bar: stage one or more compatible metrics into the
// field, then create a chart holding all of them by pressing "+" or Enter.
// Once a first metric is staged, the options narrow to those that share its
// unit and gauge/counter kind, so a chart can't end up with a mismatched axis.
function NewChartField({ options, onCreate, placeholder }) {
  const [staged, setStaged] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const stagedKeys = new Set(staged.map((series) => series.key));
  const compat = staged.length ? optionCompat(staged[0]) : null;
  const filtered = options.filter(
    (option) => !stagedKeys.has(option.key) && (compat === null || optionCompat(option) === compat)
  );

  const create = () => {
    if (!staged.length) return;
    onCreate(staged);
    setStaged([]);
    setInputValue('');
    setOpen(false); // creating the chart also dismisses the options list
  };

  // Enter creates the chart when the user isn't mid-typing a filter; while
  // typing, Enter falls through to the Autocomplete so it selects the
  // highlighted option (staging it) as usual.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim() === '' && staged.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      create();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
      <Autocomplete
        {...autocompleteProps}
        multiple
        fullWidth
        autoHighlight
        disableCloseOnSelect
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={staged}
        onChange={(_, next) => setStaged(next)}
        inputValue={inputValue}
        onInputChange={(_, next) => setInputValue(next)}
        options={filtered}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            // key is provided by getTagProps
            <Chip {...getTagProps({ index })} key={option.key} size="small" label={seriesLabel(option)} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={staged.length ? 'Add another metric…' : placeholder}
            onKeyDown={handleKeyDown}
          />
        )}
      />
      <Tooltip title="Create chart">
        <span>
          <IconButton
            color="primary"
            disabled={!staged.length}
            onClick={create}
            aria-label="Create chart"
            sx={{ mt: 0.25 }}
          >
            <Plus size={18} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

NewChartField.propTypes = {
  options: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

// `variant="inline"` is the in-chart adder (a small field that adds a metric
// immediately); the default "bar" is the staging field that builds a new chart
// from several metrics at once.
const AddSeriesField = ({ options, onAdd, onCreate, placeholder = 'Add a metric…', variant = 'bar' }) =>
  variant === 'inline' ? (
    <InlineAddField options={options} onAdd={onAdd} placeholder={placeholder} />
  ) : (
    <NewChartField options={options} onCreate={onCreate} placeholder={placeholder} />
  );

AddSeriesField.propTypes = {
  options: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  onCreate: PropTypes.func,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(['bar', 'inline']),
};

export default AddSeriesField;
