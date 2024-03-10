import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';

function SimilarSerachfield({ value, setValue }) {
  const handleChange = (newChips) => {
    const newValue = newChips.map(function (val) {
      if (Number.isInteger(parseInt(val, 10))) {
        return BigInt(val);
      } else {
        return val;
      }
    });
    setValue(newValue);
  };

  return (
    <Card sx={{ p: 2 }} variant="dual">
      <MuiChipsInput
        fullWidth
        value={value.map(function (x) {
          return x.toString();
        })}
        onChange={handleChange}
        placeholder={'Find Similar by ID'}
      />
    </Card>
  );
}

SimilarSerachfield.propTypes = {
  value: PropTypes.array,
  setValue: PropTypes.func,
};

export default SimilarSerachfield;
