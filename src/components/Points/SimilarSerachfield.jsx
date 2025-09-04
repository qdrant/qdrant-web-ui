import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Chip, Button } from '@mui/material';
import { X } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

function SimilarSerachfield({ conditions, onConditionChange, usingVector }) {
  const theme = useTheme();

  const handleDeleteChip = (conditionToDelete) => {
    const newValues = conditions.filter((condition) => {
      // Compare the actual condition objects, not the formatted string
      return !(
        condition.key === conditionToDelete.key &&
        condition.value === conditionToDelete.value &&
        condition.type === conditionToDelete.type
      );
    });
    onConditionChange(newValues);
  };

  const getChipValue = (condition) => {
    if (usingVector && condition.type === 'id') {
      return condition.key + ': ' + condition.value + ' using ' + usingVector;
    }
    return condition.key + ': ' + condition.value;
  };

  const handleDeleteAllChips = () => {
    onConditionChange([]);
  };

  return (
    conditions?.length > 0 && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2">Similar:</Typography>
          {conditions.map((condition) => (
            <Chip
              color="primary"
              size="medium"
              key={condition.key + '_' + condition.value}
              label={getChipValue(condition)}
              onDelete={() => handleDeleteChip(condition)}
            />
          ))}
        </Box>
        <Button
          variant="outlined"
          onClick={handleDeleteAllChips}
          color="text.primary"
          sx={{
            // display: 'flex',
            // alignItems: 'center',
            gap: 1,
            border: 'none',
            lineHeight: 1.5,
            mr: -1,
            borderRadius: 0,
            '&:hover': {
              boxShadow: `inset 0 -1px 0 0 ${theme.palette.divider} !important`,
            },
          }}
        >
          <X size={18} />
          Clear All
        </Button>
      </Box>
    )
  );
}

SimilarSerachfield.propTypes = {
  conditions: PropTypes.array.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  vectors: PropTypes.array.isRequired,
  usingVector: PropTypes.string,
};

export default SimilarSerachfield;
