import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import Fuse from 'fuse.js';

const CommandSearch = ({commands, setCommands}) => {
  const handleSearch = (event) => {
    const value = event.target.value;

    const fuseOptions = {
      includeScore: true,
      shouldSort: true,
      distance: 10,
      keys: [
        "method",
        "command",
        "description",
        "tags"
      ]
    };

    const fuse = new Fuse(commands, fuseOptions);

    if (value === '') {
      setCommands(commands);
    } else {
      const nextCommands = fuse.search(event.target.value).map((result) => result.item);
      setCommands(nextCommands);
    }
  }

  return (
    <TextField id="outlined-basic" label="Outlined" variant="outlined" onChange={handleSearch} />
  );
}

CommandSearch.propTypes = {
  commands: PropTypes.array.isRequired,
  setCommands: PropTypes.func.isRequired,
}

export default CommandSearch;