import React, { useEffect, useState } from 'react';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { Grid, TableContainer, Typography, Alert } from '@mui/material';
import { TableBodyWithGaps, TableWithGaps } from '../components/Common/TableWithGaps';
import { DatasetsHeader } from '../components/Datasets/DatasetsTableHeader';
import { DatasetsTableRow } from '../components/Datasets/DatasetsTableRow';
import { useClient } from '../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../components/Common/utils/snackbarOptions';
import { compareSemver } from '../lib/common-helpers';
import { useOutletContext } from 'react-router-dom';
import { useRouteAccess } from '../hooks/useRouteAccess';

function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const { client: qdrantClient } = useClient();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);
  const { version } = useOutletContext();
  const { isAccessDenied } = useRouteAccess();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://snapshots.qdrant.io/manifest.json');
        const responseJson = await response.json();
        const datasets = responseJson
          .filter((dataset) => {
            if (dataset.version === undefined) {
              return true;
            }
            // There are a few exceptions:
            // - dev version is always allowed, it includes `dev` as a substring
            // - `???` means we can't display the version, so we only allow unversioned datasets
            // - empty or underfined means the same as `???`

            if (version || version === '???') {
              return false;
            }

            if (version.includes('dev')) {
              return true;
            }
            return compareSemver(version, dataset.version) >= 0;
          })
          .map((dataset) => {
            return {
              name: dataset.name,
              fileName: dataset.file_name,
              size: dataset.size,
              vectors: dataset.vectors,
              vectorCount: dataset.vector_count,
              description: dataset.description,
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

  const tableRows = datasets.map((dataset) => (
    <DatasetsTableRow key={dataset.name} dataset={dataset} importDataset={importDataset} disabled={isAccessDenied} />
  ));

  return (
    <>
      <CenteredFrame>
        <Grid container maxWidth={'xl'} width={'100%'} spacing={3}>
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
          {!isLoading && datasets?.length === 0 && <div>No datasets found</div>}
          {!isLoading && datasets?.length > 0 && (
            <Grid size={12}>
              <TableContainer>
                <TableWithGaps aria-label="simple table">
                  <DatasetsHeader
                    headers={[
                      'Dataset Name',
                      'Datasets size',
                      'Vectors Configuration (Name, Size, Distance, Model)',
                      'Vectors count',
                      'Import',
                    ]}
                  />

                  <TableBodyWithGaps>{tableRows}</TableBodyWithGaps>
                </TableWithGaps>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Datasets;
