import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { Button, Grid, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { TableWithGaps, TableHeadWithGaps, TableBodyWithGaps } from '../Common/TableWithGaps';
import { SnapshotsTableRow } from './SnapshotsTableRow';

export const SnapshotsTab = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const errorSnackbarOptions = {
    variant: 'error',
    autoHideDuration: null,
    action: (key) => (
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => {
          closeSnackbar(key);
        }}
      >
        Dismiss
      </Button>
    ),
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  };

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
  }, [qdrantClient, collectionName]);

  const createSnapshot = () => {
    setIsLoading(true);
    qdrantClient
      .createSnapshot(collectionName)
      .then((res) => {
        setSnapshots([...snapshots, res]);
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const downloadSnapshot = (snapshotName) => {
    window.open(`${qdrantClient._restUri}/collections/${collectionName}/snapshots/${snapshotName}`);
  };

  const deleteSnapshot = (snapshotName) => {
    setIsLoading(true);
    qdrantClient
      .deleteSnapshot(collectionName, snapshotName)
      .then(() => {
        setSnapshots([...snapshots.filter((snapshot) => snapshot.name !== snapshotName)]);
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
      key={snapshot.name}
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
          <Button variant={'contained'} onClick={createSnapshot} startIcon={<PhotoCamera fontSize={'small'} />}>
            Take snapshot
          </Button>
        </Grid>
        {isLoading && <div>Loading...</div>}
        {!isLoading && snapshots?.length > 0 && (
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
                <TableBodyWithGaps>{tableRows}</TableBodyWithGaps>
              </TableWithGaps>
            </TableContainer>
          </Grid>
        )}
        {!isLoading && !snapshots?.length && (
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
