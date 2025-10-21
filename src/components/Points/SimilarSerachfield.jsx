import React from 'react';
// import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Chip, Button } from '@mui/material';
// import { MuiChipsInput } from 'mui-chips-input';
// import { bigIntJSON } from '../../common/bigIntJSON';
// import { validateUuid } from '../../common/utils';
// import ErrorNotifier from '../ToastNotifications/ErrorNotifier';
import { X } from 'lucide-react';

function SimilarSerachfield({ conditions, onConditionChange, vectors, usingVector }) {
  // const [errorMessage, setErrorMessage] = useState(null);
  console.log(vectors);

  // const handleAddChip = (chip) => {
  //   setErrorMessage(null);
  //   const keyValue = chip.split(/:(.*)/);
  //   if (keyValue.length < 2 || !keyValue[0].trim()) {
  //     setErrorMessage('Invalid format of key:value pair');
  //     return;
  //   }
  //   const key = keyValue[0].trim();
  //   const parseToPrimitive = (value) => {
  //     try {
  //       return bigIntJSON.parse(value);
  //     } catch (e) {
  //       return value;
  //     }
  //   };
  //   const value = parseToPrimitive(keyValue[1].trim());
  //   if (key === 'id') {
  //     if (value && (typeof value === 'number' || typeof value === 'bigint' || validateUuid(value))) {
  //       const id = {
  //         key: 'id',
  //         type: 'id',
  //         value: value,
  //       };
  //       if (vectors.length > 0 && usingVector === null) {
  //         onConditionChange([...conditions, id], vectors[0]); // TODO: add vector selection
  //         return;
  //       }
  //       onConditionChange([...conditions, id]);
  //     } else {
  //       setErrorMessage('Invalid id');
  //       return;
  //     }
  //   } else if (key) {
  //     if (typeof value === 'number' && value % 1 !== 0) {
  //       setErrorMessage('Float values are not supported ');
  //       return;
  //     } else if (
  //       typeof value === 'bigint' ||
  //       typeof value === 'number' ||
  //       typeof value === 'boolean' ||
  //       typeof value === 'string' ||
  //       value === null ||
  //       value === undefined
  //     ) {
  //       const payload = {
  //         key: key,
  //         type: 'payload',
  //         value: value,
  //       };
  //       onConditionChange([...conditions, payload]);
  //     } else {
  //       setErrorMessage('Invalid value');
  //       return;
  //     }
  //   }
  // };

  const handleDeleteChip = (chip) => {
    const newValues = conditions.filter(function (x) {
      return getChipValue(x) !== chip;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6">Similar:</Typography>
          {/* {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />} */}
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
        {/* todo: sizes etc. from Figma */}
        <Button
          variant="text"
          onClick={handleDeleteAllChips}
          sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'capitalize' }}
        >
          <X />
          Clear All
        </Button>
      </Box>
    )

    //   <Card sx={{ p: 2 }} variant="dual">
    //     {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}

    //     <MuiChipsInput
    //       fullWidth
    //       value={conditions.map(function (x) {
    //         return getChipValue(x);
    //       })}
    //       onAddChip={handleAddChip}
    //       onDeleteChip={handleDeleteChip}
    //       onDeleteAllChips={handleDeleteAllChips}
    //       disableEdition
    //       placeholder={
    //         'Find similar by ID or filter by payload key:value pair. Example: ' +
    //         'name: John Doe, age: 25, id: c0847827-d005-4e46-b328-887f72373d2d , id: 1234567890'
    //       }
    //     />
    //   </Card>
  );
}

SimilarSerachfield.propTypes = {
  conditions: PropTypes.array.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  vectors: PropTypes.array.isRequired,
  usingVector: PropTypes.string,
};

export default SimilarSerachfield;
