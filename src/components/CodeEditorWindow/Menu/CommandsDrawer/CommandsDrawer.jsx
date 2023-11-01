import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Typography } from '@mui/material';
import CommandsTable from './CommandsTable';
import CommandSearch from "./CommandSearch";

const CommandsDrawer = ({ open, toggleDrawer, handleInsertCommand }) => {
  const [allCommands, setAllCommands] = useState([]); // todo: use this to filter commands by tags
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + './openapi.json')
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        const nextCommands = Object.keys(data.paths)
          .map((path) => {
            return Object.keys(data.paths[path]).map((method) => {
              const command = path.replace(/{/g, '${');
              const description = data.paths[path][method].summary;
              const tags = data.paths[path][method].tags;
              const hasRequestBody = !!data.paths[path][method].requestBody;

              return {
                method: method.toUpperCase(),
                command,
                description,
                hasRequestBody,
                tags,
              };
            });
          })
          .flat();
        setAllCommands(nextCommands)
        setCommands(nextCommands);
      })
      .catch((e) => console.error(e));
    // todo: show snackbar on error
  }, []);

  return (
    <Drawer
      anchor={'right'}
      open={open}
      onClose={toggleDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: '50vw',
          padding: '1rem',
          pt: '5rem',
        },
      }}
    >
      <div>
        <Typography variant={'h5'}>Commands</Typography>
        <Typography variant={'body1'}>This is a list of commands that can be used in the editor.</Typography>
        <CommandSearch commands={allCommands} setCommands={setCommands} />
        <CommandsTable commands={commands} handleInsertCommand={handleInsertCommand} />
      </div>
    </Drawer>
  );
};

CommandsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  handleInsertCommand: PropTypes.func.isRequired,
};

export default CommandsDrawer;

// todo:
// - [x] know if command has object or not
// - [x] add search
// - [ ] set focus on search input when drawer opens
// - [ ] add keyboard navigation
// - [ ] add filter by tags
// - [ ] set cursor into the object of inserted command
