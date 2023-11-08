import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { TableBodyWithGaps, TableWithGaps } from '../../../Common/TableWithGaps';
import { alpha, Box, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

const CommandsTableRow = forwardRef(({ method, command, description, tags, onClick, isActive, ...other }, ref) => {
  const theme = useTheme();
  // const ref = React.useRef(null);
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

  return (
    <TableRow
      sx={{
        boxShadow: isActive ? `0 0 0 2px ${theme.palette.primary.dark}` : 'none',
        borderRadius: '5px',
      }}
      ref={ref}
      onClick={onClick}
      {...other}
    >
      <TableCell sx={rowStyle} width={'50px'}>
        <Tooltip title={'Insert command into the console window'} disableFocusListener>
          <IconButton onClick={onClick}>
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
              {command}
            </Typography>
            <br />
            <Typography variant={'caption'} ml={2} color={theme.palette.grey[700]}>
              {description}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={rowStyle} align="right">
        {tagList}
      </TableCell>
    </TableRow>
  );
});

CommandsTableRow.displayName = 'CommandsTableRow';

CommandsTableRow.propTypes = {
  method: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  hasRequestBody: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  onFocus: PropTypes.func.isRequired,
  tabIndex: PropTypes.number.isRequired,
};

const CommandsTable = ({ commands, handleInsertCommand }) => {
  const [active, setActive] = React.useState(null);
  const listRefs = useRef([]);

  useEffect(() => {
    setActive(null);
    listRefs.current = listRefs.current.slice(0, commands.length);
  }, [commands, commands.length]);

  const handleClick = (command) => {
    const commandText = `${command.method} ${command.command.substring(1)}${
      command.hasRequestBody ? ' \n{\n  \n}' : ''
    }`;

    handleInsertCommand(commandText);
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
    } else if (
      e.key === 'Enter' &&
      active !== null &&
      // if element is not focused but active, we need to focus it
      document.activeElement !== listRefs.current[active]
    ) {
      listRefs.current[active].focus();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  const focusBtn = (refCurrent) => {
    const button = refCurrent.children[0].firstChild;
    button.focus();
    button.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const rows = commands.map((command, index) => (
    <CommandsTableRow
      tabIndex={0} // Make the list item focusable
      ref={(el) => (listRefs.current[index] = el)}
      key={command.method + '_' + command.command}
      method={command.method}
      command={command.command}
      description={command.description}
      hasRequestBody={command.hasRequestBody}
      tags={command.tags}
      isActive={active === index}
      onClick={() => handleClick(command)}
      onFocus={() => {
        setActive(index);
        focusBtn(listRefs.current[index]);
      }}
    />
  ));

  return (
    <TableWithGaps>
      <TableBodyWithGaps>{rows}</TableBodyWithGaps>
    </TableWithGaps>
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
};

export default CommandsTable;
