import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

function InputWithIcon({ value, setValue, actions }) {
  return (
    <Card
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
      }}
      variant="dual"
    >
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

      {/* additional actions */}
      {actions?.length && actions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
    </Card>
  );
}
InputWithIcon.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.element),
};

export default InputWithIcon;
