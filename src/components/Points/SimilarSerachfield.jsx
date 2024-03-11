import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';

function SimilarSerachfield({ value, onConditionChange }) {
  const handleAddChip = (chip) => {
    if (Number.isInteger(parseInt(chip, 10))) {
      const id = {
        key: 'id',
        type: 'id',
        value: BigInt(chip),
        label: `id: ${chip}`,
      };
      onConditionChange([...value, id]);
    } else {
      const id = {
        key: 'id',
        type: 'id',
        value: chip,
        label: `id: ${chip}`,
      };
      onConditionChange([...value, id]);
    }
  };

  const handleDeleteChip = (chip) => {
    const newValues = value.filter(function (x) {
      return x.label !== chip;
    });
    onConditionChange(newValues);
  };

  return (
    <Card sx={{ p: 2 }} variant="dual">
      <MuiChipsInput
        fullWidth
        value={value.map(function (x) {
          return x.label;
        })}
        onAddChip={handleAddChip}
        onDeleteChip={handleDeleteChip}
        placeholder={'Find Similar by ID'}
      />
    </Card>
  );
}

SimilarSerachfield.propTypes = {
  value: PropTypes.array,
  onConditionChange: PropTypes.func,
};

export default SimilarSerachfield;
