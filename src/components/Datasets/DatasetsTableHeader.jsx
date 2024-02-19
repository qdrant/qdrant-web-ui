import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { TableHeadWithGaps } from '../Common/TableWithGaps';
import PropTypes from 'prop-types';

export const DatasetsHeader = ({ headers }) => {
  return (
    <TableHeadWithGaps>
      <TableRow>
        {headers.map((header, index) => (
          <TableCell
            key={header}
            sx={{ fontWeight: 'bold' }}
            align={index === 0 ? 'left' : index === headers.lenght - 1 ? 'right' : 'center'}
          >
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHeadWithGaps>
  );
};

DatasetsHeader.propTypes = {
  headers: PropTypes.array.isRequired,
};
