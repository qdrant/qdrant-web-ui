import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";
import { SnapshotsUpload } from "../CodeEditorWindow/Snapshots/SnapshotsUpload";

// todo: move additional buttons to actions and pass them as props
function InputWithIcon({ value, setValue }) {
  return (
    <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }} elevation={2}>
      <OutlinedInput
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Collection"
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        }
        sx={{ maxWidth: 500 }}
      />

      <SnapshotsUpload />
    </Card>
  );
}
InputWithIcon.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
};

export default InputWithIcon;
