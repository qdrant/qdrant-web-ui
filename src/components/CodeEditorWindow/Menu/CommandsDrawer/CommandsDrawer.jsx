import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Typography } from '@mui/material';
import CommandsTable from './CommandsTable';

const CommandsDrawer = ({ open, toggleDrawer }) => {
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + './openapi.json')
      .then((response) => response.json())
      .then((data) => {
        const nextCommands = Object.keys(data.paths)
          .map((path) => {
            return Object.keys(data.paths[path]).map((method) => {
              const command = path.replace(/{/g, '${');
              const description = data.paths[path][method].summary;
              const tags = data.paths[path][method].tags;

              return {
                method: method.toUpperCase(),
                command,
                description,
                tags,
              };
            });
          })
          .flat();

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
        <CommandsTable commands={commands} />
      </div>
    </Drawer>
  );
};

CommandsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default CommandsDrawer;
