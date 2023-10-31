import React from "react";
import PropTypes from "prop-types";
import {
  TableBodyWithGaps,
  TableWithGaps,
} from "../../../Common/TableWithGaps";
import { alpha, Chip, TableCell, TableRow, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { ArrowBack } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

const CommandsTableRow = ({ method, command, description }) => {
  const theme = useTheme();
  const getColor = (method) => {
    switch (method) {
      case "GET":
        return "success";
      case "POST":
        return "info";
      case "PUT":
        return "warning";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };
  const rowStyle = {
    background: alpha(theme.palette[getColor(method)].light, 0.05),
    borderColor: `${theme.palette[getColor(method)].main} !important`,
  };
  console.log(theme.palette);
  return (
    <TableRow>
      <TableCell sx={rowStyle} width={"50px"}>
        <Tooltip title={"Insert command into the console window"}>
          <IconButton>
            <ArrowBack/>
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={{
        ...rowStyle,
        pl: 0,
      }}>
        <Chip color={getColor(method)} label={method} size="small"/>
        <Typography component={"code"} ml={2}>{command}</Typography>
        <Typography variant={"caption"} ml={2}
                    color={theme.palette.grey[700]}>{description}</Typography>
      </TableCell>
    </TableRow>
  );
};

CommandsTableRow.propTypes = {
  method: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const CommandsTable = ({ commands }) => {
  const rows = commands.map((command) => (
    <CommandsTableRow
      key={command.method + "_" + command.command}
      method={command.method}
      command={command.command}
      description={command.description}/>
  ));
  return (
    <TableWithGaps>
      <TableBodyWithGaps>
        {rows}
      </TableBodyWithGaps>
    </TableWithGaps>
  );
};

CommandsTable.propTypes = {
  commands: PropTypes.arrayOf(PropTypes.shape({
    method: PropTypes.string.isRequired,
    command: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })).isRequired,
};

export default CommandsTable;