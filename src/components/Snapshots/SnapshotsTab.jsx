import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { Button, Grid, Link, Table, TableCell, TableRow, Typography } from '@mui/material';
import { Camera } from 'lucide-react';
import {
  StyledTableContainer,
  StyledTableHead,
  StyledHeaderCell,
  StyledTableBody,
  StyledTableRow,
} from '../Common/StyledTable';
import { SnapshotsTableRow } from './SnapshotsTableRow';
import { pumpFile, updateProgress } from '../../common/utils';
import InfoBanner from '../Common/InfoBanner';

export const SnapshotsTab = ({ collectionName }) => {
  const { t } = useTranslation();
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
        t('snapshots.waitPreviousDownload'),
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
          enqueueSnackbar(t('snapshots.downloadCanceled'), getSnackbarOptions('warning', closeSnackbar, 2000));
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
        enqueueSnackbar(t('snapshots.snapshotDeleted'), getSnackbarOptions('success', closeSnackbar, 2000));
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
      <Grid container alignItems="center" spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Typography variant="h4" component={'h1'}>
            {t('snapshots.title')}
          </Typography>
        </Grid>
        <Grid
          sx={{ display: 'flex', justifyContent: 'end' }}
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Button
            variant={'contained'}
            onClick={createSnapshot}
            startIcon={<Camera size={18} />}
            disabled={isSnapshotLoading}
          >
            {t('snapshots.takeSnapshot')}
          </Button>
        </Grid>
        {remoteShards && remoteShards.length !== 0 && (
          <InfoBanner severity={'warning'}>
            <Typography>
              {t('snapshots.snapshotNotFull')}
            </Typography>

            {localShards.length > 0 && (
              <>
                <Typography>{t('snapshots.localShards')}</Typography>
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
              <Typography>{t('snapshots.remoteShards')}</Typography>
              <ul>
                {remoteShards.map((shard) => (
                  <Typography component={'li'} key={shard.shard_id}>
                    Id: {shard.shard_id} ({shard.peer_id})
                  </Typography>
                ))}
              </ul>
            </>
            <Typography>
              {t('snapshots.forMoreInfo', {
                link: <Link href={'https://qdrant.tech/documentation/tutorials/create-snapshot/'} target="_blank">{t('snapshots.documentation')}</Link>,
              })}
            </Typography>
          </InfoBanner>
        )}
        {isLoading && <div>{t('snapshots.loading')}</div>}
        {(snapshots?.length > 0 || isSnapshotLoading) && (
          <Grid size={12}>
            <StyledTableContainer>
              <Table aria-label="simple table">
                <StyledTableHead>
                  <TableRow>
                    <StyledHeaderCell>{t('snapshots.snapshotName')}</StyledHeaderCell>
                    <StyledHeaderCell align="center">{t('snapshots.createdAt')}</StyledHeaderCell>
                    <StyledHeaderCell align="center">{t('snapshots.size')}</StyledHeaderCell>
                    <StyledHeaderCell align="center">{t('snapshots.actions')}</StyledHeaderCell>
                  </TableRow>
                </StyledTableHead>
                <StyledTableBody>
                  {tableRows}

                  {isSnapshotLoading && (
                    <StyledTableRow>
                      <TableCell colSpan={4} align="center">
                        {t('snapshots.loading')}
                      </TableCell>
                    </StyledTableRow>
                  )}
                </StyledTableBody>
              </Table>
            </StyledTableContainer>
          </Grid>
        )}
        {!isLoading && !snapshots?.length && !isSnapshotLoading && (
          <Grid textAlign={'center'} size={12}>
            <Typography>{t('snapshots.noSnapshots')}</Typography>
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
