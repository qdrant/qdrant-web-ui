import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import CollapsibleCard from '../../Common/CollapsibleCard';
import ClusterInfoHead from './ClusterInfoHead';
import ClusterShardRow from './ClusterShardRow';
import { bigIntJSON } from '../../../common/bigIntJSON';

const ClusterInfo = ({ collectionCluster = { result: {} }, ...other }) => {
  const shards = [
    ...(collectionCluster.result?.local_shards || []),
    ...(collectionCluster.result?.remote_shards || []),
  ];

  const shardRows = shards.map((shard) => (
    <ClusterShardRow
      shard={shard}
      clusterPeerId={collectionCluster.result?.peer_id}
      key={shard.shard_id.toString() + (shard.peer_id || '')}
    />
  ));

  return (
    <CollapsibleCard
      title="Collection Cluster Info"
      action={<CopyButton text={bigIntJSON.stringify(collectionCluster)} />}
      {...other}
    >
      <Table>
        <ClusterInfoHead />
        <TableBody
          sx={{
            // last row should have no border
            '& tr:last-of-type td': {
              borderBottom: 'none',
            },
          }}
        >
          {shardRows}
        </TableBody>
      </Table>
    </CollapsibleCard>
  );
};

ClusterInfo.propTypes = {
  collectionCluster: PropTypes.shape({
    result: PropTypes.shape({
      peer_id: PropTypes.number,
      local_shards: PropTypes.arrayOf(
        PropTypes.shape({
          shard_id: PropTypes.number,
          state: PropTypes.string,
        })
      ),
      remote_shards: PropTypes.arrayOf(
        PropTypes.shape({
          shard_id: PropTypes.number,
          peer_id: PropTypes.number,
          state: PropTypes.string,
        })
      ),
    }),
  }).isRequired,
  other: PropTypes.object,
};

export default ClusterInfo;
