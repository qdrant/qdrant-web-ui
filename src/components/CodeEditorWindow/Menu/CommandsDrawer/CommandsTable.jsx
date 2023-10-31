import React from 'react';
import PropTypes from 'prop-types';
import { TableBodyWithGaps, TableWithGaps } from '../../../Common/TableWithGaps';
import { alpha, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

const CommandsTableRow = ({ method, command, description, tags }) => {
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
  const tagList = tags.map((tag) => (
    <Typography
      key={tag}
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
      <br />
    </Typography>
  ));

  return (
    <TableRow>
      <TableCell sx={rowStyle} width={'50px'}>
        <Tooltip title={'Insert command into the console window'}>
          <IconButton>
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
        <Chip color={colorName} label={method} size="small" />
        <Typography component={'code'} ml={2}>
          {command}
        </Typography>
        <Typography variant={'caption'} ml={2} color={theme.palette.grey[700]}>
          {description}
        </Typography>
      </TableCell>
      <TableCell sx={rowStyle} align="right">
        {tagList}
      </TableCell>
    </TableRow>
  );
};

CommandsTableRow.propTypes = {
  method: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const CommandsTable = ({ commands }) => {
  const rows = commands.map((command) => (
    <CommandsTableRow
      key={command.method + '_' + command.command}
      method={command.method}
      command={command.command}
      description={command.description}
      tags={command.tags}
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
};

export default CommandsTable;
