import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Drawer, Typography, IconButton } from '@mui/material';
import CommandsTable from './CommandsTable';
import CommandSearch from './CommandSearch';
import Close from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../../Common/utils/snackbarOptions';
import { resolveRequiredBodyParams } from '../../config/CommandsDrawerUtils';

const CommandsDrawer = ({ open, toggleDrawer, handleInsertCommand }) => {
  const [allCommands, setAllCommands] = useState([]);
  const [commands, setCommands] = useState([]);
  const [searchTerms, setSearchTerms] = useState([]);
  const matchesMdMedia = useMediaQuery('(max-width: 992px)');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar, 6000);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + './openapi.json')
      .then((response) => response.json())
      .then((data) => {
        const nextCommands = Object.keys(data.paths)
          .map((path) => {
            return Object.keys(data.paths[path]).map((method) => {
              const command = path.replace(/{/g, '<').replace(/}/g, '>');
              const description = data.paths[path][method].summary;
              const tags = data.paths[path][method].tags;
              const hasRequestBody = !!data.paths[path][method].requestBody;
              let requiredBodyParameters = null;
              if (hasRequestBody) {
                requiredBodyParameters = resolveRequiredBodyParams(data, data.paths[path][method].requestBody.content);
              }
              const operationId = data.paths[path][method].operationId;

              return {
                method: method.toUpperCase(),
                command,
                description,
                hasRequestBody,
                tags,
                requiredBodyParameters,
                operationId,
              };
            });
          })
          .flat();
        setAllCommands(nextCommands);
        setCommands(nextCommands);
      })
      .catch((e) => {
        enqueueSnackbar('Error fetching commands', errorSnackbarOptions);
        console.error(e);
      });
  }, []);

  return (
    <Drawer
      anchor={'right'}
      open={open}
      onClose={toggleDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          minWidth: matchesMdMedia ? '100vw' : '680px',
          width: matchesMdMedia ? '100vw' : '55vw',
          padding: '1rem',
          pt: '6rem',
          display: 'flex',
          flexDirection: 'column',
        },
        '& .MuiBackdrop-root.MuiModal-backdrop': {
          opacity: '0 !important',
        },
      }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mr: 2 }}>
          <Typography variant={'h5'}>Commands</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Box>
        <Typography variant={'body1'} mb={4}>
          This is a list of commands that can be used in the editor.
        </Typography>
        <CommandSearch commands={allCommands} setCommands={setCommands} setSearchTerms={setSearchTerms} />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <CommandsTable commands={commands} handleInsertCommand={handleInsertCommand} searchTerms={searchTerms} />
      </Box>
    </Drawer>
  );
};

CommandsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  handleInsertCommand: PropTypes.func.isRequired,
};

export default CommandsDrawer;
