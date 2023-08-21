import { TableCell, TableRow, Typography } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

const ClusterShardRow = ({ shard, clusterPeerId }) => {
  return (
    <TableRow data-testid="shard-row">
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {shard.shard_id}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {shard.peer_id ? `Remote (${shard.peer_id})` : `Local (${clusterPeerId ?? 'unknown'})`}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {shard.state}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

ClusterShardRow.propTypes = {
  shard: PropTypes.shape({
    shard_id: PropTypes.number,
    peer_id: PropTypes.number,
    state: PropTypes.string,
  }).isRequired,
  clusterPeerId: PropTypes.number,
};

export default ClusterShardRow;
