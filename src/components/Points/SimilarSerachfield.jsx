import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';

function SimilarSerachfield({ value, setValue }) {
  const handleChange = (newChips) => {
    const result = newChips.map(function (x) {
      return parseInt(x, 10);
    });
    setValue(result);
  };

  return (
    <Card sx={{ p: 2 }} variant="dual">
      <MuiChipsInput fullWidth value={value} onChange={handleChange} placeholder={'Find Similar by ID'} />
    </Card>
  );
}
SimilarSerachfield.propTypes = {
  value: PropTypes.array,
  setValue: PropTypes.func,
};

export default SimilarSerachfield;
