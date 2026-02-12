import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { ArcherContainer } from 'react-archer';
import { Grid, Typography, Box } from '@mui/material';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import { useTelemetry } from '../../../context/telemetry-context';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import ClusterNode from './ClusterNode';
import { Circle } from '../../Common/Circle';
import { CLUSTER_COLORS, CLUSTER_STYLES } from './constants';
import InfoBanner from '../../Common/InfoBanner';
import { StyledShardSlot } from './StyledComponents/StyledShardSlot';
import ShardTransferDialog from './ShardTransferDialog';
import ReshardingDialog from './ReshardingDialog';
import AbortReshardingDialog from './AbortReshardingDialog';
import ReshardingButtons from './ReshardingButtons';

/**
 * Legend component to explain the status of shards in the cluster.
 * @param {Object} sx - MUI sx prop for custom styles
 * @return {React.JSX.Element}
 * @constructor
 */
const Legend = ({ sx, dragState }) => {
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
          alignItems: 'center',
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
        {dragState.isDragging && (
          <Box display="flex" alignItems="center" gap={0.5} sx={{ ml: 2, pl: 2, borderLeft: '1px solid #ccc' }}>
            <Circle
              size={'1rem'}
              color={theme.palette.mode === 'dark' ? CLUSTER_COLORS.empty.dark : CLUSTER_COLORS.empty.light}
              sx={{
                border: CLUSTER_STYLES.dragAndDrop.awaiting.border,
              }}
            />
            <Typography variant="caption">Drop Here</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

Legend.propTypes = {
  sx: PropTypes.object,
  dragState: PropTypes.shape({
    isDragging: PropTypes.bool.isRequired,
    draggedSlot: PropTypes.object,
  }),
};

const ClusterMonitor = ({ collectionName }) => {
  const theme = useTheme();
  const { client: qdrantClient, isRestricted } = useClient();
  const { reshardingEnabled } = useTelemetry();
  const [cluster, setCluster] = React.useState(null);
  const [dragState, setDragState] = React.useState({
    isDragging: false,
    draggedSlot: null,
  });
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [transferDialog, setTransferDialog] = React.useState({
    open: false,
    transferRequest: null,
  });
  const [transferLoading, setTransferLoading] = React.useState(false);
  const [reshardingLoading, setReshardingLoading] = React.useState(false);
  const [reshardingDialog, setReshardingDialog] = React.useState({
    open: false,
    direction: null,
  });
  const [abortReshardingDialog, setAbortReshardingDialog] = React.useState(false);

  const handleSlotGrab = (e, peerId, slotId, shard) => {
    if (!shard || shard.state !== 'Active') return; // Can only grab non-empty and active slots

    setDragState({
      isDragging: true,
      draggedSlot: { peerId, slotId, shard },
    });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for drag element positioning
  const handleMouseMove = (e) => {
    if (dragState.isDragging) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }

    // scroll long monitor if the user reaches the edge
    const clusterMonitor = document.querySelector('[data-cluster-monitor]');
    if (clusterMonitor) {
      const rect = clusterMonitor.getBoundingClientRect();
      const scrollLeft = clusterMonitor.scrollLeft;
      const scrollWidth = clusterMonitor.scrollWidth;
      const clientWidth = clusterMonitor.clientWidth;
      const mouseX = e.clientX - rect.left;
      const scrollStep = 16;

      // todo: how to make it to look smooth?
      // Check if we need to scroll right (mouse near right edge and can scroll right)
      if (mouseX > clientWidth - 50 && scrollLeft + clientWidth < scrollWidth) {
        clusterMonitor.scrollLeft = scrollLeft + scrollStep;
      }
      // Check if we need to scroll left (mouse near left edge and can scroll left)
      if (mouseX < 50 && scrollLeft > 0) {
        clusterMonitor.scrollLeft = scrollLeft - scrollStep;
      }
    }
  };

  const handleSlotDrop = (targetPeerId, targetSlotId) => {
    if (!dragState.isDragging || !dragState.draggedSlot) return;

    const { peerId: sourcePeerId, slotId: sourceSlotId } = dragState.draggedSlot;

    // If shard dropped in the same slot - return without doing anything
    if (sourcePeerId === targetPeerId && sourceSlotId === targetSlotId) {
      setDragState({ isDragging: false, draggedSlot: null });
      return;
    }

    // Open confirmation dialog instead of direct API call
    setTransferDialog({
      open: true,
      transferRequest: {
        shard: dragState.draggedSlot.shard,
        fromPeerId: sourcePeerId,
        toPeerId: targetPeerId,
      },
    });

    setDragState({ isDragging: false, draggedSlot: null });
  };

  // Helper function to refresh cluster info
  const refreshClusterInfo = async () => {
    try {
      const clusterInfo = await axios.get(`/cluster`);
      const collectionClusterInfo = await qdrantClient
        .api('cluster')
        .collectionClusterInfo({ collection_name: collectionName });

      const newCluster = collectionClusterInfo.data.result;
      const localShards =
        newCluster.local_shards && newCluster.local_shards.length > 0
          ? newCluster.local_shards.map((shard) => {
              return {
                ...shard,
                peer_id: newCluster.peer_id,
              };
            })
          : [];
      newCluster.shards = [...localShards, ...(newCluster.remote_shards || [])];

      newCluster.peers = clusterInfo?.data?.result?.peers
        ? Object.keys(clusterInfo.data.result.peers)
            .map((peerId) => parseInt(peerId))
            .sort((a, b) => a - b)
        : [];
      newCluster.status = clusterInfo?.data?.result?.status || 'disabled';
      // shard_count and resharding_operations are already included in newCluster from the API response
      setCluster({ ...newCluster });
    } catch (err) {
      console.error('Error refreshing cluster info:', err);
      throw err;
    }
  };

  const handleTransferConfirm = async (transferRequest) => {
    setTransferLoading(true);

    try {
      await qdrantClient.updateCollectionCluster(collectionName, {
        move_shard: {
          shard_id: transferRequest.shard.shard_id,
          to_peer_id: transferRequest.toPeerId,
          from_peer_id: transferRequest.fromPeerId,
        },
      });

      enqueueSnackbar('Shard transfer initiated successfully', getSnackbarOptions('success', closeSnackbar, 2000));

      // Close dialog and refresh cluster info
      setTransferDialog({ open: false, transferRequest: null });

      // Refresh cluster info to show updated state
      await refreshClusterInfo();
    } catch (err) {
      console.error('Error moving shard:', err);
      enqueueSnackbar(`Failed to transfer shard: ${err.message}`, getSnackbarOptions('error', closeSnackbar));
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferDialogClose = () => {
    setTransferDialog({ open: false, transferRequest: null });
  };

  const handleDragCancel = () => {
    setDragState({ isDragging: false, draggedSlot: null });
  };

  const handleResharding = (direction) => {
    // Open confirmation dialog
    setReshardingDialog({
      open: true,
      direction,
    });
  };

  const handleReshardingConfirm = async (direction, shardKey) => {
    setReshardingLoading(true);

    try {
      const requestPayload = {
        start_resharding: {
          direction,
        },
      };

      // Add shard_key if provided
      if (shardKey !== null && shardKey !== undefined) {
        requestPayload.start_resharding.shard_key = shardKey;
      }

      await qdrantClient.updateCollectionCluster(collectionName, requestPayload);

      enqueueSnackbar(
        `Resharding ${direction} initiated successfully`,
        getSnackbarOptions('success', closeSnackbar, 2000)
      );

      // Close dialog and refresh cluster info
      setReshardingDialog({ open: false, direction: null });

      // Refresh cluster info to show updated state
      await refreshClusterInfo();
    } catch (err) {
      console.error(`Error starting resharding ${direction}:`, err);
      enqueueSnackbar(
        `Failed to start resharding ${direction}: ${err.message}`,
        getSnackbarOptions('error', closeSnackbar)
      );
    } finally {
      setReshardingLoading(false);
    }
  };

  const handleReshardingDialogClose = () => {
    setReshardingDialog({ open: false, direction: null });
  };

  const handleAbortResharding = () => {
    // Open confirmation dialog
    setAbortReshardingDialog(true);
  };

  const handleAbortReshardingConfirm = async () => {
    setReshardingLoading(true);

    try {
      await qdrantClient.updateCollectionCluster(collectionName, {
        abort_resharding: {},
      });

      enqueueSnackbar('Resharding operation aborted successfully', getSnackbarOptions('success', closeSnackbar, 2000));

      // Close dialog and refresh cluster info
      setAbortReshardingDialog(false);

      // Refresh cluster info to show updated state
      await refreshClusterInfo();
    } catch (err) {
      console.error('Error aborting resharding:', err);
      enqueueSnackbar(`Failed to abort resharding: ${err.message}`, getSnackbarOptions('error', closeSnackbar));
    } finally {
      setReshardingLoading(false);
    }
  };

  const handleAbortReshardingDialogClose = () => {
    setAbortReshardingDialog(false);
  };

  // Add global event listeners for drag cancellation
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (dragState.isDragging && !e.target.closest('[data-cluster-slot]')) {
        handleDragCancel();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dragState.isDragging) {
        handleDragCancel();
      }
    };

    if (dragState.isDragging) {
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragState.isDragging]);

  // Fetch cluster info and update cluster state
  useEffect(() => {
    const fetchClusterInfo = async () => {
      if (isRestricted) {
        return;
      }

      try {
        await refreshClusterInfo();
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    };

    fetchClusterInfo();
  }, [collectionName, isRestricted, qdrantClient]);

  // Extract unique shard keys from all shards (must be before conditional return)
  const shardKeys = React.useMemo(() => {
    if (!cluster?.shards || cluster.shards.length === 0) return [];
    const keys = new Set();
    cluster.shards.forEach((shard) => {
      if (shard && shard.shard_key != null) {
        keys.add(shard.shard_key);
      }
    });
    return Array.from(keys).sort();
  }, [cluster?.shards]);

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
        gridRowGap: '1rem',
        // breakpoints
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: '50px 1fr',
        },
      }}
    >
      <Box sx={{ gridArea: '1 / 2 / 2 / 3', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1">Cluster Nodes</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ReshardingButtons
            cluster={cluster}
            reshardingEnabled={reshardingEnabled}
            reshardingLoading={reshardingLoading}
            transferLoading={transferLoading}
            onResharding={handleResharding}
            onAbortResharding={handleAbortResharding}
          />
        </Box>
      </Box>
      <Box sx={{ gridArea: ' 1 / 3 / 2 / 6', display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <Legend dragState={dragState} />
      </Box>
      <Box sx={{ gridArea: '1 / 1 / 6 / 2', alignContent: 'center', marginTop: '1rem' }}>
        <Typography
          variant="subtitle1"
          sx={{ writingMode: 'vertical-lr', textAlign: 'center', transform: 'rotate(180deg)' }}
        >
          Shards
        </Typography>
      </Box>
      <Box
        data-cluster-monitor
        sx={{
          width: 'auto',
          height: 'fit-content',
          padding: '0.5rem 0.5rem 1.5rem 0.5rem',
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
          <ArcherContainer
            strokeColor={theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main}
            lineStyle={'angle'}
          >
            <Grid container spacing={2}>
              {cluster.peers?.map((peerId) => (
                <Grid key={peerId} size={'grow'}>
                  <ClusterNode
                    peerId={peerId}
                    cluster={cluster}
                    dragState={dragState}
                    onSlotGrab={handleSlotGrab}
                    onSlotDrop={handleSlotDrop}
                    onDragCancel={handleDragCancel}
                  />
                </Grid>
              ))}
            </Grid>
          </ArcherContainer>
        </Box>
      </Box>

      {/* Floating drag element that follows the cursor */}
      {dragState.isDragging && dragState.draggedSlot && (
        <>
          <Box
            sx={{
              position: 'fixed',
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
              width: '50px',
              height: '50px',
              zIndex: 9999,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              transition: 'none', // Disable transition for smooth cursor following
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
            }}
          >
            <StyledShardSlot
              state={dragState.draggedSlot.shard.state.toLowerCase()}
              dragAndDropState="grabbed"
              sx={{
                width: '50px',
                height: '50px',
                opacity: 0.9,
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {dragState.draggedSlot.shard.shard_id}
              </Typography>
              {dragState.draggedSlot.shard.shard_key && (
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    fontSize: '0.6rem',
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {dragState.draggedSlot.shard.shard_key}
                </Typography>
              )}
            </StyledShardSlot>
          </Box>
        </>
      )}

      {/* Add ShardTransferDialog */}
      <ShardTransferDialog
        open={transferDialog.open}
        onClose={handleTransferDialogClose}
        transferRequest={transferDialog.transferRequest}
        onConfirm={handleTransferConfirm}
        loading={transferLoading}
        collectionName={collectionName}
      />

      {/* Add ReshardingDialog */}
      <ReshardingDialog
        open={reshardingDialog.open}
        onClose={handleReshardingDialogClose}
        direction={reshardingDialog.direction}
        onConfirm={handleReshardingConfirm}
        loading={reshardingLoading}
        collectionName={collectionName}
        shardKeys={shardKeys}
      />

      {/* Add AbortReshardingDialog */}
      <AbortReshardingDialog
        open={abortReshardingDialog}
        onClose={handleAbortReshardingDialogClose}
        onConfirm={handleAbortReshardingConfirm}
        loading={reshardingLoading}
        collectionName={collectionName}
      />
    </Box>
  );
};

ClusterMonitor.propTypes = {
  collectionName: PropTypes.string,
};

export default ClusterMonitor;
