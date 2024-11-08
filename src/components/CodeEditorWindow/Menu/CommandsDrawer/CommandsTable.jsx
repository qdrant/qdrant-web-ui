import React, { forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { TableBodyWithGaps, TableWithGaps } from '../../../Common/TableWithGaps';
import {
  alpha,
  Box,
  Chip,
  TableCell,
  TableRow,
  Typography,
  Modal,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../../Common/utils/snackbarOptions';
import { debounce } from 'lodash';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import _ from 'lodash';

const DOCS_BASE_URL = 'https://api.qdrant.tech/api-reference/';

const CommandsTableRow = forwardRef((props, ref) => {
  const { method, command, description, tags, onClick, tabIndex, isActive, searchTerms, operationId } = props;
  const theme = useTheme();

  const getColor = (method) => {
    switch (method) {
      case 'GET':
        return 'success';
      case 'POST':
        return 'info';
      case 'PUT':
        return 'warning';
      case 'PATCH':
        return 'secondary';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const colorName = getColor(method);
  const color = theme.palette[colorName].main;
  const rowStyle = {
    background: alpha(theme.palette[colorName].light, 0.05),
    borderColor: `${color} !important`,
  };

  const highlightText = (text, searchTerms) => {
    if (searchTerms.length === 0) {
      return text;
    }
    const escapedSearchTerms = searchTerms.map(_.escapeRegExp);
    const regex = new RegExp(`(${escapedSearchTerms.join('|')})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ color: 'yellow' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const tagList = tags.map((tag) => (
    <React.Fragment key={tag}>
      <Typography
        component={'span'}
        variant={'caption'}
        color={colorName}
        sx={{
          display: 'inline-block',
          color,
          border: `1px solid ${color}`,
          px: 0.5,
          borderRadius: '5px',
          ml: 0.5,
          my: 0.5,
        }}
      >
        #{tag}
      </Typography>
      <br />
    </React.Fragment>
  ));

  const docsURL = `${DOCS_BASE_URL}${tags[0].toLowerCase()}/${operationId.replace(/_/g, '-')}`;

  return (
    <TableRow
      sx={{
        boxShadow: isActive ? `0 0 0 2px ${theme.palette.primary.dark}` : 'none',
        borderRadius: '5px',
      }}
      ref={ref}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      <TableCell sx={rowStyle} width={'50px'}>
        <Tooltip title={'Insert command into the console window'} disableFocusListener>
          <IconButton onClick={onClick} className={'insert-button'}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{
          ...rowStyle,
          pl: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip color={colorName} label={method} size="small" />
          <Box>
            <Typography component={'code'} ml={2}>
              {highlightText(command, searchTerms)}
            </Typography>
            <br />
            <Typography
              variant={'caption'}
              ml={2}
              color={theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.grey[400]}
            >
              {highlightText(description, searchTerms)}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={rowStyle} align="right">
        {tagList}
        <Typography variant="caption">
          <Link href={docsURL} target="_blank" rel="noopener noreferrer">
            Documentation
          </Link>
        </Typography>
      </TableCell>
    </TableRow>
  );
});

CommandsTableRow.displayName = 'CommandsTableRow';

CommandsTableRow.propTypes = {
  method: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  tabIndex: PropTypes.number.isRequired,
  searchTerms: PropTypes.array,
  operationId: PropTypes.string.isRequired,
};

const CommandsTable = ({ commands, handleInsertCommand, searchTerms }) => {
  const [active, setActive] = React.useState(null);
  const listRefs = useRef([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const successSnackbarOptions = getSnackbarOptions('success', closeSnackbar, 1000);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ bodyParams: [], pathParams: [] });
  const [currentCommand, setCurrentCommand] = useState(null);

  useEffect(() => {
    setActive(null);
    listRefs.current = listRefs.current.slice(0, commands.length);
  }, [commands, commands.length]);

  useEffect(() => {
    console.log('commands', searchTerms);
  }, [searchTerms]);

  const handleModalOpen = (command) => {
    setCurrentCommand(command);
    setModalData({
      bodyParams: command.requiredBodyParameters || [],
      pathParams: command.requiredPathParameters || [],
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentCommand(null);
  };

  const handleModalSubmit = () => {
    const bodyParams = modalData.bodyParams
      .map((param, index) => `"${param}": "${document.getElementById(`body-param-${index}`).value}"`)
      .join(',\n  ');
    const pathParams = modalData.pathParams.reduce((acc, param, index) => {
      acc[param] = document.getElementById(`path-param-${index}`).value;
      return acc;
    }, {});

    let commandText = currentCommand.command;
    Object.keys(pathParams).forEach((param) => {
      commandText = commandText.replace(`<${param}>`, pathParams[param]);
    });

    commandText = `${currentCommand.method} ${commandText.substring(1)}${
      currentCommand.hasRequestBody ? ` \n{\n  ${bodyParams}\n}` : ''
    }`;

    handleInsertCommand(commandText);
    enqueueSnackbar('Command inserted', successSnackbarOptions);
    handleModalClose();
  };

  const handleClick = (command) => {
    if ((command.requiredBodyParameters && command.requiredBodyParameters) || command.requiredPathParameters.length) {
      handleModalOpen(command);
    } else {
      const commandText = `${command.method} ${command.command.substring(1)}`;

      handleInsertCommand(commandText);
      enqueueSnackbar('Command inserted', successSnackbarOptions);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (active === null) {
        setActive(0);
        listRefs.current[0].focus();
        return;
      }
      const nextActive = (active + 1) % commands.length;
      setActive(nextActive);
      listRefs.current[nextActive].focus();
    } else if (e.key === 'ArrowUp') {
      if (active === null) {
        setActive(commands.length - 1);
        listRefs.current[commands.length - 1].focus();
        return;
      }
      const nextActive = (active - 1 + commands.length) % commands.length;
      setActive(nextActive);
      listRefs.current[nextActive].focus();
    } else if (e.key === 'Enter' && active !== null) {
      handleClick(commands[active]);
    }
  };

  const debouncedHandleKeyDown = debounce(handleKeyDown, 30);

  useEffect(() => {
    window.addEventListener('keydown', debouncedHandleKeyDown);

    return () => {
      window.removeEventListener('keydown', debouncedHandleKeyDown);
    };
  }, [active]);

  const groupedCommands = commands.reduce((acc, command) => {
    command.tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = [];
      }
      acc[tag].push(command);
    });
    return acc;
  }, {});

  const accordions = Object.keys(groupedCommands).map((tag) => (
    <Accordion key={tag}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${tag}-content`} id={`${tag}-header`}>
        <Typography>{tag}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableWithGaps>
          <TableBodyWithGaps>
            {groupedCommands[tag].map((command, index) => (
              <CommandsTableRow
                tabIndex={0}
                ref={(el) => (listRefs.current[index] = el)}
                key={command.method + '_' + command.command}
                method={command.method}
                command={command.command}
                description={command.description}
                searchTerms={searchTerms}
                tags={command.tags}
                isActive={active === index}
                onClick={(e) => {
                  if (e.target.classList.contains('insert-button') || e.target.closest('.insert-button')) {
                    handleClick(command);
                  }
                }}
                operationId={command.operationId}
              />
            ))}
          </TableBodyWithGaps>
        </TableWithGaps>
      </AccordionDetails>
    </Accordion>
  ));

  const rows = commands.map((command, index) => (
    <CommandsTableRow
      tabIndex={0} // Make the list item focusable
      ref={(el) => (listRefs.current[index] = el)}
      key={command.method + '_' + command.command}
      method={command.method}
      command={command.command}
      description={command.description}
      tags={command.tags}
      isActive={active === index}
      searchTerms={searchTerms}
      onClick={(e) => {
        // we want insert command only if user clicks on the button with the class 'insert-button'
        if (e.target.classList.contains('insert-button') || e.target.closest('.insert-button')) {
          handleClick(command);
        }
      }}
      operationId={command.operationId}
    />
  ));

  return (
    <>
      {searchTerms.length === 0 ? (
        accordions
      ) : (
        <TableWithGaps>
          <TableBodyWithGaps>{rows}</TableBodyWithGaps>
        </TableWithGaps>
      )}

      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Enter required parameters
          </Typography>
          {modalData.bodyParams.map((param, index) => (
            <TextField key={param} id={`body-param-${index}`} label={param} fullWidth margin="normal" />
          ))}
          {modalData.pathParams.map((param, index) => (
            <TextField key={param} id={`path-param-${index}`} label={param} fullWidth margin="normal" />
          ))}
          <Button onClick={handleModalSubmit} variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
};

CommandsTable.propTypes = {
  commands: PropTypes.arrayOf(
    PropTypes.shape({
      method: PropTypes.string.isRequired,
      command: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    })
  ).isRequired,
  handleInsertCommand: PropTypes.func.isRequired,
  searchTerms: PropTypes.array.isRequired,
};

export default CommandsTable;
