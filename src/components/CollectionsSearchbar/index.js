import React from "react";
import PropTypes from 'prop-types';
import { styled} from '@mui/material/styles';
import { Toolbar, OutlinedInput, InputAdornment } from '@mui/material';
import { Search } from "@mui/icons-material";

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  marginLeft: theme.spacing(1),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.16)",
  },
  '& fieldset': {
    borderWidth: `1px !important`,
  },
}));

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName }) {
  return (
    <StyledRoot>
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="Search collections..."
          startAdornment={
            <InputAdornment position="start">
              <Search/>
            </InputAdornment>
          }
        />
    </StyledRoot>
  );
}
