import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { Button, Grid, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { TableWithGaps, TableHeadWithGaps, TableBodyWithGaps } from '../Common/TableWithGaps';
import { SnapshotsTableRow } from './SnapshotsTableRow';

export const SnapshotsTab = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);

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
    if (isDownloading) {
      enqueueSnackbar(
        'Please wait until the previous download is finished',
        getSnackbarOptions('warning', closeSnackbar, 2000)
      );
      return;
    }
    setIsDownloading(true);
    const apiKey = JSON.parse(localStorage.getItem('settings'))?.apiKey;

    const headers = {
      'Content-Disposition': 'attachment; filename="snapshot.tar.gz"',
      'Content-Type': 'application/gzip',
    };

    if (apiKey) {
      headers['api-key'] = apiKey;
    }

    const request = new Request(`${qdrantClient._restUri}/collections/${collectionName}/snapshots/${snapshotName}`, {
      method: 'GET',
      headers,
    });

    fetch(request)
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Network response was not ok.');
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = snapshotName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setIsDownloading(false);
      })
      .catch((error) => {
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
      key={snapshot.name}
      snapshot={snapshot}
      isDownloading={isDownloading}
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
