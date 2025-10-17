import React from 'react';
import { TableRow } from '@mui/material';
import { StyledTableHead, StyledHeaderCell } from '../Common/StyledTable';
import PropTypes from 'prop-types';

export const DatasetsHeader = ({ headers }) => {
  return (
    <StyledTableHead>
      <TableRow>
        {headers.map((header, index) => (
          <StyledHeaderCell
            key={header}
            align={index === 0 ? 'left' : index === headers.length - 1 ? 'right' : 'center'}
            dangerouslySetInnerHTML={{ __html: header }}
          />
        ))}
      </TableRow>
    </StyledTableHead>
  );
};

DatasetsHeader.propTypes = {
  headers: PropTypes.array.isRequired,
};
