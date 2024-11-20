import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { Button, Grid, Link, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { TableWithGaps, TableHeadWithGaps, TableBodyWithGaps } from '../Common/TableWithGaps';
import { SnapshotsTableRow } from './SnapshotsTableRow';
import { pumpFile, updateProgress } from '../../common/utils';
import InfoBanner from '../Common/InfoBanner';

export const SnapshotsTab = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);
  const [localShards, setLocalShards] = useState([]);
  const [remoteShards, setRemoteShards] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    qdrantClient
      .listSnapshots(collectionName)
      .then((res) => {
        setSnapshots([...res]);
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      })
      .finally(() => {
        setIsLoading(false);
      });

    qdrantClient
      .api('cluster')
      .collectionClusterInfo({ collection_name: collectionName })
      .then((res) => {
        const remoteShards = res.data.result.remote_shards;
        const localShards = res.data.result.local_shards;
        if (remoteShards.length > 0) {
          setRemoteShards(remoteShards);
          setLocalShards(localShards);
        }
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      });
  }, [qdrantClient, collectionName]);

  const createSnapshot = () => {
    setIsSnapshotLoading(true);
    qdrantClient
      .createSnapshot(collectionName)
      .then((res) => {
        setSnapshots([...snapshots, res]);
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      })
      .finally(() => {
        setIsSnapshotLoading(false);
      });
  };

  const downloadSnapshot = (snapshotName, snapshotSize, progress, setProgress) => {
    if (progress > 0) {
      enqueueSnackbar(
        'Please wait until the previous download is finished',
        getSnackbarOptions('warning', closeSnackbar, 2000)
      );
      return;
    }
    qdrantClient
      .downloadSnapshot(collectionName, snapshotName)
      .then((response) => {
        const reader = response.body.getReader();
        const handleProgress = updateProgress(snapshotSize, setProgress);

        return pumpFile(reader, handleProgress);
      })
      .then((chunks) => {
        return new Blob(chunks);
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = snapshotName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => {
          setProgress(0);
        }, 500);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          enqueueSnackbar('Download canceled', getSnackbarOptions('warning', closeSnackbar, 2000));
          return;
        }
        enqueueSnackbar(error.message, errorSnackbarOptions);
      });
  };

  const deleteSnapshot = (snapshotName) => {
    setIsLoading(true);
    qdrantClient
      .deleteSnapshot(collectionName, snapshotName)
      .then(() => {
        setSnapshots([...snapshots.filter((snapshot) => snapshot.name !== snapshotName)]);
        enqueueSnackbar('Snapshot successfully deleted', getSnackbarOptions('success', closeSnackbar, 2000));
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const tableRows = snapshots.map((snapshot) => (
    <SnapshotsTableRow
      key={snapshot.creation_time?.valueOf() || 'unknown'}
      snapshot={snapshot}
      downloadSnapshot={downloadSnapshot}
      deleteSnapshot={deleteSnapshot}
    />
  ));

  return (
    <div>
      <Grid container alignItems="center">
        <Grid item xs={12} md={8}>
          <h1>Snapshots</h1>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button
            variant={'contained'}
            onClick={createSnapshot}
            startIcon={<PhotoCamera fontSize={'small'} />}
            disabled={isSnapshotLoading}
          >
            Take snapshot
          </Button>
        </Grid>
        {remoteShards && remoteShards.length !== 0 && (
          <InfoBanner severity={'warning'}>
            <Typography>
              Snapshot will not contain the full collection. It will only include shards on the current machine.
            </Typography>

            {localShards.length > 0 && (
              <>
                <Typography>Local shards:</Typography>
                <ul>
                  {localShards.map((shard) => (
                    <Typography component={'li'} key={shard.shard_id}>
                      Id: {shard.shard_id}
                    </Typography>
                  ))}
                </ul>
              </>
            )}
            <>
              <Typography>Remote shards (not included in the snapshot):</Typography>
              <ul>
                {remoteShards.map((shard) => (
                  <Typography component={'li'} key={shard.shard_id}>
                    Id: {shard.shard_id} ({shard.peer_id})
                  </Typography>
                ))}
              </ul>
            </>
            <Typography>
              For more information, please visit the{' '}
              <Link href={'https://qdrant.tech/documentation/tutorials/create-snapshot/'} target="_blank">
                documentation
              </Link>
              .
            </Typography>
          </InfoBanner>
        )}
        {isLoading && <div>Loading...</div>}
        {(snapshots?.length > 0 || isSnapshotLoading) && (
          <Grid item xs={12}>
            <TableContainer>
              <TableWithGaps aria-label="simple table">
                <TableHeadWithGaps>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Snapshot Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">
                      Created at
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">
                      Size
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeadWithGaps>
                <TableBodyWithGaps>
                  {tableRows}

                  {isSnapshotLoading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBodyWithGaps>
              </TableWithGaps>
            </TableContainer>
          </Grid>
        )}
        {!isLoading && !snapshots?.length && !isSnapshotLoading && (
          <Grid item xs={12} textAlign={'center'}>
            <Typography>No snapshots yet, take one! 📸</Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

// props validation
SnapshotsTab.propTypes = {
  collectionName: PropTypes.string.isRequired,
};
