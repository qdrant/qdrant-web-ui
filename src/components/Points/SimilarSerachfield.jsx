import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';
import { useClient } from '../../context/client-context';
import { useParams } from 'react-router-dom';

function SimilarSerachfield({ conditions, onConditionChange }) {
  const { client: qdrantClient } = useClient();
  const [vectors, setVectors] = useState([]);
  const { collectionName } = useParams();

  useEffect(() => {
    const getCollection = async () => {
      const collection = await qdrantClient.getCollection(collectionName);
      const vectors = [];
      Object.keys(collection.config.params.vectors).map((key) => {
        if (typeof collection.config.params.vectors[key] === 'object') {
          vectors.push(key);
        }
      });
      setVectors(vectors);
    };
    getCollection();
  }, []);

  const handleAddChip = (chip) => {
    const keyValue = chip.split(':');
    const key = keyValue[0].trim();
    let value = null;
    if (Number.isInteger(parseInt(keyValue[1], 10))) {
      value = BigInt(keyValue[1]);
    } else {
      value = keyValue[1].trim();
    }
    if (key && value) {
      if (key === 'id') {
        const id = {
          key: 'id',
          type: 'id',
          value: value,
          label: vectors.length > 0 ? `id: ${value} using: ${vectors[0]}` : `id: ${value}`, // TODO: add a selector for vector
          using: vectors.length > 0 ? vectors[0] : null,
        };
        onConditionChange([...conditions, id]);
      } else {
        const payload = {
          key: key,
          type: 'payload',
          value: value,
          label: `${key}: ${value}`,
        };
        onConditionChange([...conditions, payload]);
      }
    }
  };

  const handleDeleteChip = (chip) => {
    const newValues = conditions.filter(function (x) {
      return x.label !== chip;
    });
    onConditionChange(newValues);
  };

  return (
    <Card sx={{ p: 2 }} variant="dual">
      <MuiChipsInput
        fullWidth
        value={conditions.map(function (x) {
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
  conditions: PropTypes.array,
  onConditionChange: PropTypes.func,
};

export default SimilarSerachfield;
