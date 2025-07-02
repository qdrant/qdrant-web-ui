import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, Grid } from '@mui/material';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

const ClusterMonitor = ({collectionName}) => {
  const { client: qdrantClient, isRestricted } = useClient();
  const [cluster, setCluster] = React.useState(null);

  useEffect(() => {
    if (isRestricted) {
      return;
    }

    // todo: remove example when not needed
    // response example:
    // {
    //   "peer_id": 507064763663115,
    //   "shard_count": 6,
    //   "local_shards": [
    //   {
    //     "shard_id": 2,
    //     "points_count": 0,
    //     "state": "Active"
    //   },
    //   {
    //     "shard_id": 5,
    //     "points_count": 0,
    //     "state": "Active"
    //   }
    // ],
    //   "remote_shards": [
    //   {
    //     "shard_id": 0,
    //     "peer_id": 8364297585145765,
    //     "state": "Active"
    //   },
    //   {
    //     "shard_id": 1,
    //     "peer_id": 3667824378830955,
    //     "state": "Active"
    //   },
    //   {
    //     "shard_id": 3,
    //     "peer_id": 8364297585145765,
    //     "state": "Active"
    //   },
    //   {
    //     "shard_id": 4,
    //     "peer_id": 3667824378830955,
    //     "state": "Active"
    //   }
    // ],
    //   "shard_transfers": []
    // }
    qdrantClient
    .api('cluster')
    .collectionClusterInfo({ collection_name: collectionName })
    .then((res) => {
      const newCluster = res.data.result;
      const localShards = newCluster.local_shards.length && newCluster.local_shards.map(shard => {
        return {
          ...shard,
          peer_id: newCluster.peer_id
        }
      });
      newCluster.shards = [...(localShards || []), ...(newCluster.remote_shards || [])];
      newCluster.peers = [...new Set([newCluster.peer_id, ...newCluster.shards.map(shard => shard.peer_id)])];
      console.log(newCluster.peers);
      setCluster({ ...newCluster });
    })
    .catch((err) => {
      enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
    });
  }, [collectionName]);


  // todo: remove
  useEffect(() => {
    console.log('Cluster Info:', cluster);
  }, [cluster])

  return (
    <Card variant="dual" sx={{ mb: 5 }}>
      <CardHeader
        title="Cluster Monitor"
        variant="heading"
      />
      <CardContent sx={{ '&:last-child': { pb: 1 } }}>
      <Grid container spacing={1}>
        {cluster && cluster.peers.map((peerId) => (
          <Grid item xs={12} sm={6} md={4} key={peerId}>
            <Node peerId={peerId} shards={cluster.shards.filter(shard => shard.peer_id === peerId)} />
          </Grid>
        ))}
        {(!cluster || cluster.peers.length === 0) && (
          <Grid item xs={12}>
            <p>No nodes found in the cluster.</p>
          </Grid>
        )}
      </Grid>
    </CardContent>
    </Card>
  );
}

ClusterMonitor.propTypes = {
  collectionName: PropTypes.string,
};

const StyledNode = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: theme.spacing(2),
  border: '1px solid #ccc',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const Node = ({peerId, shards}) => {
  return (
    <StyledNode>
      <h3>Node {peerId}</h3>

      {shards.length > 0 ? (
        shards.map((shard) => (
          <Shard shard={shard} key={shard.shard_id} />
        ))
      ) : (
        <p>No shards found for this node.</p>
      )}
    </StyledNode>
  );
}

Node.propTypes = {
  peerId: PropTypes.number.isRequired,
  shards: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const StyledShard = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  border: '1px solid #ccc',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
}));

const Shard = ({shard}) => {
  return (
    <StyledShard>
      <h4>Shard {shard.shard_id}</h4>
      <p>State: {shard.state}</p>
      <p>Points Count: {shard.points_count}</p>
      {shard.peer_id && <p>Peer ID: {shard.peer_id}</p>}
    </StyledShard>
  );
}

Shard.propTypes = {
  shard: PropTypes.shape({
    shard_id: PropTypes.number.isRequired,
    state: PropTypes.string,
    points_count: PropTypes.number,
    peer_id: PropTypes.number.isRequired,
  }).isRequired,
}

export default ClusterMonitor;