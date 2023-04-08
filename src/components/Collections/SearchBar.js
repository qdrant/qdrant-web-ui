import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

function InputWithIcon({value,setValue}) {
  return (
    <Card sx={{ p: 2 }} elevation={2}>
    <OutlinedInput
      fullWidth
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search Collection"
      startAdornment={(
        <InputAdornment position="start">
          <SvgIcon
            color="action"
            fontSize="small"
          >
            <SearchIcon />
          </SvgIcon>
        </InputAdornment>
      )}
      sx={{ maxWidth: 500 }}
    />
  </Card>
  );
}
InputWithIcon.propTypes = {
    value: PropTypes.string,
    setValue: PropTypes.func
  };
  
export default  InputWithIcon;

