import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, Table, TableBody } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
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
    <Card variant="dual" {...other}>
      <CardHeader
        title={'Collection Cluster Info'}
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={<CopyButton text={bigIntJSON.stringify(collectionCluster)} />}
      />
      <Table>
        <ClusterInfoHead />
        <TableBody>{shardRows}</TableBody>
      </Table>
    </Card>
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
