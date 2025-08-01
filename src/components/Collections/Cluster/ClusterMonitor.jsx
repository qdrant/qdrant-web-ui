/* eslint-disable */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { ArcherContainer } from 'react-archer';
import { Grid, Typography } from '@mui/material';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import ClusterNode from './ClusterNode';
import { Box } from '@mui/system';

// todo: remove eslint-disable

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
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '20px 1fr',
      gridTemplateRows: 'auto 1fr',
      gridColumnGap: 0,
      gridRowGap: 0,
      // breakpoints
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '50px 1fr',
      }
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
        width: 'auto',
        height: 'fit-content',
        overflowX: 'auto',
        gridArea: '2 / 2 / 6 / 10',
        gap: '0.5rem',
        '& svg': {
          zIndex: 10,
        }
      }}>

        <Box sx={{
          width: cluster?.peers.length >= 40 ? 'max-content' : '100%',
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
                  size={'grow'}
                >
                  <ClusterNode peerId={peerId} cluster={cluster} />
                </Grid>
              ))}
            {(typeof cluster !== 'object' || cluster?.peers.length === 0) && (
              <Grid size={12}>
                <p>No nodes found in the cluster.</p>
              </Grid>
            )}
          </Grid>
        </ArcherContainer>
        </Box>
      </Box>
    </Box>
  );
};

ClusterMonitor.propTypes = {
  collectionName: PropTypes.string,
};

export default ClusterMonitor;
