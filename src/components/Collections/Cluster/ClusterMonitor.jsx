import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { ArcherContainer } from 'react-archer';
import { Grid, Typography, Box } from '@mui/material';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import ClusterNode from './ClusterNode';
import { Circle } from '../../Common/Circle';
import { CLUSTER_COLORS } from './constants';
import InfoBanner from '../../Common/InfoBanner';

/**
 * Legend component to explain the status of shards in the cluster.
 * @param {Object} sx - MUI sx prop for custom styles
 * @return {React.JSX.Element}
 * @constructor
 */
const Legend = ({ sx }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: '0 10px',
        margin: '10px 0',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Circle
            size={'1rem'}
            color={theme.palette.mode === 'dark' ? CLUSTER_COLORS.empty.dark : CLUSTER_COLORS.empty.light}
          />
          <Typography variant="caption">Empty</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Circle size={'1rem'} color={CLUSTER_COLORS.active} />
          <Typography variant="caption">Active</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Circle size={'1rem'} color={CLUSTER_COLORS.dead} />
          <Typography variant="caption">Dead</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Circle size={'1rem'} color={CLUSTER_COLORS.default} />
          <Typography variant="caption">Other</Typography>
        </Box>
      </Box>
    </Box>
  );
};

Legend.propTypes = {
  sx: PropTypes.object,
};

const ClusterMonitor = ({ collectionName }) => {
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
        newCluster.status = clusterInfo?.data?.result?.status || 'disabled';
        setCluster({ ...newCluster });
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    };

    fetchClusterInfo();
  }, [collectionName, isRestricted, qdrantClient]);

  if (!cluster || cluster.status !== 'enabled') {
    return (
      <Box>
        <InfoBanner severity={'warning'} hideCloseButton={true}>
          <Typography>Distributed mode is not enabled for this cluster.</Typography>
        </InfoBanner>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr',
        gridTemplateRows: 'auto 1fr',
        gridColumnGap: '0.5rem',
        gridRowGap: 0,
        // breakpoints
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: '50px 1fr',
        },
      }}
    >
      <Box sx={{ gridArea: '1 / 2 / 2 / 3' }}>
        <Typography variant="subtitle1" mb={2}>
          Cluster Nodes
        </Typography>
      </Box>
      <Box sx={{ gridArea: ' 1 / 3 / 2 / 6', justifyContent: 'end' }}>
        <Legend />
      </Box>
      <Box sx={{ gridArea: '1 / 1 / 6 / 2', alignContent: 'center' }}>
        <Typography
          variant="subtitle1"
          sx={{ writingMode: 'vertical-lr', textAlign: 'center', transform: 'rotate(180deg)' }}
        >
          Shards
        </Typography>
      </Box>
      <Box
        sx={{
          width: 'auto',
          height: 'fit-content',
          paddingBottom: '1.5rem',
          overflowX: 'auto',
          gridArea: '2 / 2 / 6 / 10',
          '& svg': {
            zIndex: 10,
          },
        }}
      >
        <Box
          sx={{
            minWidth: '100%',
            width: 'max-content',
          }}
        >
          <ArcherContainer strokeColor={theme.palette.mode === 'dark' ? '#d4d9e6' : '#647cb9'} lineStyle={'angle'}>
            <Grid container spacing={2}>
              {cluster.peers?.map((peerId) => (
                <Grid key={peerId} size={'grow'}>
                  <ClusterNode peerId={peerId} cluster={cluster} />
                </Grid>
              ))}
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
