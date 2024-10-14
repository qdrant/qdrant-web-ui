import React, { useEffect, useState } from 'react';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { Grid, TableContainer, Typography } from '@mui/material';
import { TableBodyWithGaps, TableWithGaps } from '../components/Common/TableWithGaps';
import { DatasetsHeader } from '../components/Datasets/DatasetsTableHeader';
import { DatasetsTableRow } from '../components/Datasets/DatasetsTableRow';
import { useClient } from '../context/client-context';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../components/Common/utils/snackbarOptions';
import { compareSemver } from '../lib/common-helpers';
import { useOutletContext } from 'react-router-dom';

function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const { client: qdrantClient } = useClient();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);
  const { version } = useOutletContext();

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
    <DatasetsTableRow key={dataset.name} dataset={dataset} importDataset={importDataset} />
  ));

  return (
    <>
      <CenteredFrame>
        <Grid container maxWidth={'xl'} spacing={3}>
          <Grid xs={12} item>
            <Typography variant="h4">Datasets</Typography>
          </Grid>
          {isLoading && <div>Loading...</div>}
          {!isLoading && datasets?.length === 0 && <div>No datasets found</div>}
          {!isLoading && datasets?.length > 0 && (
            <Grid item xs={12}>
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
