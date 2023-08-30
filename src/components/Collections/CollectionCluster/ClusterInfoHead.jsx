import { TableCell, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';

const ClusterInfoHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <Typography variant="subtitle1" fontWeight={600}>
            Shard ID
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle1" fontWeight={600}>
            Location
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="subtitle1" fontWeight={600}>
            Status
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default ClusterInfoHead;
