import React, { useEffect, useMemo, useState } from 'react';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';
import { Grid, Table, Typography, Alert } from '@mui/material';
import { StyledTableContainer, StyledTableBody } from '../components/Common/StyledTable';
import { DatasetsHeader } from '../components/Datasets/DatasetsTableHeader';
import { DatasetsTableRow } from '../components/Datasets/DatasetsTableRow';
import { useClient } from '../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../components/Common/utils/snackbarOptions';
import { isVersionInRange } from '../lib/common-helpers';
// import { useOutletContext } from 'react-router';
import { useVersion } from '../context/telemetry-context';
import { useRouteAccess } from '../hooks/useRouteAccess';

function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const { client: qdrantClient } = useClient();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);
  const { version } = useVersion();
  const { isAccessDenied } = useRouteAccess();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://snapshots.qdrant.io/manifest-v1.20.0.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch datasets manifest: ${response.status}`);
        }
        const responseJson = await response.json();
        if (!Array.isArray(responseJson)) {
          throw new Error('Datasets manifest has an unexpected format');
        }
        const datasets = responseJson
          .filter((dataset) => typeof dataset === 'object' && dataset !== null && typeof dataset.name === 'string')
          .map((dataset) => {
            return {
              name: String(dataset.name),
              fileName: String(dataset.file_name ?? ''),
              size: Number(dataset.size) || 0,
              vectors: dataset.vectors,
              vectorCount: Number(dataset.vector_count) || 0,
              description: String(dataset.description ?? ''),
              minVersion: dataset.min_version,
              maxVersion: dataset.max_version,
            };
          });
        setDatasets(datasets);
      } catch (error) {
        enqueueSnackbar(error.message, errorSnackbarOptions);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const importDataset = async (fileName, collectionName, setImporting, importing) => {
    if (isAccessDenied) {
      enqueueSnackbar('Access denied: You do not have permission to import datasets', errorSnackbarOptions);
      return;
    }

    if (importing) {
      enqueueSnackbar('Importing in progress', errorSnackbarOptions);
      return;
    } else if (!collectionName) {
      enqueueSnackbar('Collection name is required', errorSnackbarOptions);
      return;
    } else {
      setImporting(true);

      try {
        await qdrantClient.recoverSnapshot(collectionName, {
          location: `https://snapshots.qdrant.io/${fileName}`,
        });
        enqueueSnackbar('Snapshot successfully imported', getSnackbarOptions('success', closeSnackbar, 2000));
      } catch (e) {
        enqueueSnackbar(e.message, errorSnackbarOptions);
      } finally {
        setImporting(false);
      }
    }
  };

  const availableDatasets = useMemo(
    () =>
      datasets.filter((dataset) => {
        if (!dataset.minVersion && !dataset.maxVersion) {
          return true;
        }
        // If the server version is unknown, only show datasets without version constraints
        if (!version) {
          return false;
        }
        return isVersionInRange(version, dataset.minVersion, dataset.maxVersion);
      }),
    [datasets, version]
  );

  const tableRows = availableDatasets.map((dataset) => (
    <DatasetsTableRow key={dataset.name} dataset={dataset} importDataset={importDataset} disabled={isAccessDenied} />
  ));

  return (
    <>
      <CenteredFrame>
        <Grid container maxWidth={PAGE_CONTENT_WIDTH.wide} width={'100%'} spacing={3}>
          <Grid size={12}>
            <Typography variant="h4">Datasets</Typography>
          </Grid>
          {isAccessDenied && (
            <Grid size={12}>
              <Alert severity="warning">
                You do not have permission to import datasets. Please contact your administrator.
              </Alert>
            </Grid>
          )}
          {isLoading && <div>Loading...</div>}
          {!isLoading && availableDatasets.length === 0 && <div>No datasets found</div>}
          {!isLoading && availableDatasets.length > 0 && (
            <Grid size={12}>
              <StyledTableContainer>
                <Table aria-label="Datasets table">
                  <DatasetsHeader
                    headers={['Name', 'Datasets&nbsp;size', 'Vectors Config', 'Vectors count', 'Actions']}
                  />

                  <StyledTableBody>{tableRows}</StyledTableBody>
                </Table>
              </StyledTableContainer>
            </Grid>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Datasets;
