import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { ArcherContainer } from 'react-archer';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import ClusterNode from './ClusterNode';
import { Box } from '@mui/system';

// todo:
// - [x] show empty slots in nodes
// - [x] shard status colors
// - [x] arrow to shard (transfer.shard_id || shard.shard_id)
// - [ ] hover on arrow shows shard transfer info (not sure if needed)
// - [x] looks ok in both light and dark themes
//   - [x] organize what I already have for dark theme
//   - [x] add colors for light theme
// - [ ] improve animation design
// - [ ] try arrow animation
// - [ ] drag and drop shards between nodes

const ClusterMonitor = ({ collectionName }) => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const { client: qdrantClient, isRestricted } = useClient();
  const [cluster, setCluster] = React.useState(null);

  useEffect(() => {
    const fetchClusterInfo = async () => {
      if (isRestricted) {
        return;
      }

      try {
        const clusterInfo = await axios.get(`/cluster`);

        const collectionClusterInfo = await qdrantClient
          .api('cluster')
          .collectionClusterInfo({ collection_name: collectionName });

        const newCluster = collectionClusterInfo.data.result;
        const localShards =
          newCluster.local_shards.length &&
          newCluster.local_shards.map((shard) => {
            return {
              ...shard,
              peer_id: newCluster.peer_id,
            };
          });
        newCluster.shards = [...(localShards || []), ...(newCluster.remote_shards || [])];

        newCluster.peers = clusterInfo?.data?.result?.peers
          ? Object.keys(clusterInfo.data.result.peers)
              .map((peerId) => parseInt(peerId))
              .sort((a, b) => a - b)
          : [];
        setCluster({ ...newCluster });
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    };

    fetchClusterInfo();
  }, [collectionName, isRestricted, qdrantClient]);

  // todo: remove
  useEffect(() => {
    console.log('Cluster Info:', cluster);
  }, [cluster]);

  return (
    <Card variant="dual" sx={{ mb: 5 }}>
      <CardHeader title="Cluster Monitor" variant="heading" />
      <CardContent sx={{ '&:last-child': { pb: 5 } }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr',
            gridTemplateRows: 'auto 1fr',
            gridColumnGap: 0,
            gridRowGap: 0,
          }}
          >
            <Box sx={{ gridArea: '1 / 2 / 2 / 10', }}>
              <Typography variant="subtitle1" sx={{ textAlign: 'center' }} mb={2}>
                Cluster Nodes
              </Typography>
            </Box>
            <Box sx={{ gridArea: '2 / 1 / 6 / 2', alignContent: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ writingMode: 'vertical-lr', textAlign: 'center', transform: 'rotate(180deg)' }}
              >
                Shards
              </Typography>
            </Box>
            <Box sx={{
              gridArea: '2 / 2 / 6 / 10',
              '& svg': {
                zIndex: 10,
              }
            }}>

              <ArcherContainer
                strokeColor={theme.palette.mode === 'dark' ? '#d4d9e6' : '#647cb9'}
                lineStyle={'angle'}
              >

          <Grid container spacing={1}>
            {cluster &&
              cluster.peers.map((peerId) => (
                <Grid
                  key={peerId}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: cluster.peers.length >= 12 ? 1 : 'grow',
                  }}
                >
                  <Typography variant={'caption'}
                              fontWeight='bolder' textAlign='center' component={'div'}>{peerId}</Typography>
                  <ClusterNode peerId={peerId} cluster={cluster} />
                </Grid>
              ))}
            {(!cluster || cluster.peers.length === 0) && (
              <Grid size={12}>
                <p>No nodes found in the cluster.</p>
              </Grid>
            )}
          </Grid>
        </ArcherContainer>
            </Box>
          </Box>
      </CardContent>
    </Card>
  );
};

ClusterMonitor.propTypes = {
  collectionName: PropTypes.string,
};

export default ClusterMonitor;
