import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

const CommandSearch = ({ commands, setCommands, setSearchTerms }) => {
  
    const ref = React.useRef(null);
  const handleSearch = (event) => {
    const { value } = event.target;

    if (value === '') {
      setCommands(commands);
      setSearchTerms([]);
    } else {
      const searchTerms = value.split(' ');
      setSearchTerms(searchTerms);
      const nextCommands = commands
        .reduce((acc, command) => {
          const commandTerms = [command.method, command.command, command.description];
          const matches = searchTerms.reduce((acc, searchTerm) => {
            const escapedSearchTerm = _.escapeRegExp(searchTerm);
            const regex = new RegExp(`\\b(${escapedSearchTerm})`, 'gmi');
            return acc + commandTerms.join(' ').match(regex)?.length;
          }, 0);

          if (matches > 0) {
            acc.push({ ...command, matches });
          }

          return acc;
        }, [])
        .sort((a, b) => b.matches - a.matches);

      setCommands(nextCommands);
    }
  };

  // set focus on mount
  React.useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <TextField
      id="command-search"
      label="Search command"
      variant="outlined"
      fullWidth
      placeholder={'GET collections'}
      inputRef={ref}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      onChange={handleSearch}
    />
  );
};

CommandSearch.propTypes = {
  commands: PropTypes.array.isRequired,
  setCommands: PropTypes.func.isRequired,
  setSearchTerms: PropTypes.func.isRequired,
};

export default CommandSearch;
