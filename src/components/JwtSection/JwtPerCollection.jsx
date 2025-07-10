import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, TableContainer, Switch } from '@mui/material';
import { HeaderTableCell, TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';

const CollectionAccessToggle = ({ collection, globalAccess, manageAccess, onChange }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onChange(collection, newValue);
  };

  React.useEffect(() => {
    if (globalAccess) {
      setValue('r');
    } else if (manageAccess) {
      setValue('rw');
    } else {
      setValue('');
    }
  }, [globalAccess, manageAccess]);

  return (
    <TableRow>
      <TableCell>{collection}</TableCell>
      <TableCell align="center">
        <Switch
          checked={value === 'r' || value === 'rw'}
          onChange={(e) =>
            handleChange(
              e,
              (() => {
                if (value === 'r' || value === 'rw') {
                  return '';
                }
                return 'r';
              })()
            )
          }
          disabled={globalAccess || manageAccess}
        />
      </TableCell>
      <TableCell align="center">
        <Switch
          checked={value === 'rw'}
          onChange={(e) =>
            handleChange(
              e,
              (() => {
                if (value === 'rw') {
                  return 'r';
                } else if (value === '' || value === 'r') {
                  return 'rw';
                }
              })()
            )
          }
          disabled={globalAccess || manageAccess}
        />
      </TableCell>
    </TableRow>
  );
};

CollectionAccessToggle.propTypes = {
  collection: PropTypes.string.isRequired,
  globalAccess: PropTypes.bool.isRequired,
  manageAccess: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const JwtPerCollection = ({ globalAccess, manageAccess, collections, setConfiguredCollections }) => {
  return (
    <TableContainer>
      <TableWithGaps aria-label="Access per Collection">
        <TableHeadWithGaps>
          <TableRow>
            <HeaderTableCell width="33%">Collection Name</HeaderTableCell>
            <HeaderTableCell width="33%" align="center">
              Read
            </HeaderTableCell>
            <HeaderTableCell width="33%" align="center">
              Write
            </HeaderTableCell>
          </TableRow>
        </TableHeadWithGaps>
        <TableBodyWithGaps>
          {collections.map((collection) => (
            <CollectionAccessToggle
              key={collection}
              collection={collection}
              globalAccess={globalAccess}
              manageAccess={manageAccess}
              onChange={(col, access) => {
                setConfiguredCollections((prev) => {
                  const existing = prev.find((item) => item.collection === col);
                  if (existing) {
                    if (access === '') {
                      return prev.filter((item) => item.collection !== col);
                    }
                    return prev.map((item) => (item.collection === col ? { ...item, access } : item));
                  }
                  if (access === '') {
                    return prev;
                  }
                  return [...prev, { collection: col, access }];
                });
              }}
            />
          ))}
        </TableBodyWithGaps>
      </TableWithGaps>
    </TableContainer>
  );
};

JwtPerCollection.propTypes = {
  globalAccess: PropTypes.bool.isRequired,
  manageAccess: PropTypes.bool.isRequired,
  collections: PropTypes.arrayOf(PropTypes.string).isRequired,
  setConfiguredCollections: PropTypes.func.isRequired,
};

export default JwtPerCollection;
