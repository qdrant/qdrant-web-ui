import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import { bigIntJSON } from '../../common/bigIntJSON';
import { validateUuid } from '../../common/utils';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';

function SimilarSerachfield({ conditions, onConditionChange, vectors, usingVector }) {
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAddChip = (chip) => {
    setErrorMessage(null);
    const keyValue = chip.split(':');
    const key = keyValue[0].trim();
    const parseToPrimitive = (keyValue) => {
      try {
        return bigIntJSON.parse(keyValue[1].trim());
      } catch (e) {
        return keyValue[1].trim();
      }
    };
    const value = parseToPrimitive(keyValue);
    if (key === 'id') {
      if (value && (typeof value === 'number' || typeof value === 'bigint' || validateUuid(value))) {
        const id = {
          key: 'id',
          type: 'id',
          value: value,
        };
        if (vectors.length > 0 && usingVector === null) {
          onConditionChange([...conditions, id], vectors[0]); // TODO: add vector selection
          return;
        }
        onConditionChange([...conditions, id]);
      } else {
        setErrorMessage('Invalid id');
        return;
      }
    } else if (key) {
      if (typeof value === 'number' && value % 1 !== 0) {
        setErrorMessage('Float values are not supported ');
        return;
      } else if (
        typeof value === 'bigint' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'string' ||
        value === null ||
        value === undefined
      ) {
        const payload = {
          key: key,
          type: 'payload',
          value: value,
        };
        onConditionChange([...conditions, payload]);
      } else {
        setErrorMessage('Invalid value');
        return;
      }
    }
  };

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
    <Card sx={{ p: 2 }} variant="dual">
      {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
      <MuiChipsInput
        fullWidth
        value={conditions.map(function (x) {
          return getChipValue(x);
        })}
        onAddChip={handleAddChip}
        onDeleteChip={handleDeleteChip}
        onDeleteAllChips={handleDeleteAllChips}
        placeholder={
          'Find similar by ID or filter by payload key:value pair. Example: ' +
          'name: John Doe, age: 25, id: c0847827-d005-4e46-b328-887f72373d2d , id: 1234567890'
        }
      />
    </Card>
  );
}

SimilarSerachfield.propTypes = {
  conditions: PropTypes.array.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  vectors: PropTypes.array.isRequired,
  usingVector: PropTypes.string,
};

export default SimilarSerachfield;
