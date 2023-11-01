import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import Fuse from 'fuse.js';

const CommandSearch = ({commands, setCommands}) => {
  const ref = React.useRef(null);

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
      inputRef={ref}
      onChange={handleSearch} />
  );
}

CommandSearch.propTypes = {
  commands: PropTypes.array.isRequired,
  setCommands: PropTypes.func.isRequired,
}

export default CommandSearch;