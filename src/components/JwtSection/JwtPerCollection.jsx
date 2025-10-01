import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Table, Switch } from '@mui/material';
import {
  StyledTableContainer,
  StyledTableHead,
  StyledHeaderCell,
  StyledTableBody,
  StyledTableRow,
} from '../Common/StyledTable';

const CollectionAccessToggle = ({ collection, globalAccess, manageAccess, onChange }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onChange(collection, newValue);
  };

  React.useEffect(() => {
    if (manageAccess) {
      setValue('rw');
    } else if (globalAccess) {
      setValue('r');
    } else {
      setValue('');
    }
  }, [globalAccess, manageAccess]);

  return (
    <StyledTableRow>
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
    </StyledTableRow>
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
    <StyledTableContainer>
      <Table aria-label="Access per Collection">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell width="33%" sx={{ py: 2 }}>
              Collection Name
            </StyledHeaderCell>
            <StyledHeaderCell width="33%" align="center">
              Read
            </StyledHeaderCell>
            <StyledHeaderCell width="33%" align="center">
              Write
            </StyledHeaderCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
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
        </StyledTableBody>
      </Table>
    </StyledTableContainer>
  );
};

JwtPerCollection.propTypes = {
  globalAccess: PropTypes.bool.isRequired,
  manageAccess: PropTypes.bool.isRequired,
  collections: PropTypes.arrayOf(PropTypes.string).isRequired,
  setConfiguredCollections: PropTypes.func.isRequired,
};

export default JwtPerCollection;
