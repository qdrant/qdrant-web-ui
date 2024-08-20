import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { Download, FolderZip } from '@mui/icons-material';
import ImportDatasetDialog from './ImportDatasetDialog';
import VectorsConfigChip from '../Common/VectorsConfigChip';

export const DatasetsTableRow = ({ dataset, importDataset }) => {
  const theme = useTheme();
  const [importing, setImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <TableRow key={dataset.name} align={'center'}>
      <TableCell width={'50%'}>
        <Tooltip title={'Import Dataset'} arrow placement={'top'}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              cursor: importing ? 'default' : 'pointer',
              '&:hover': {
                textDecoration: !importing ? 'underline' : 'none',
                '& .MuiSvgIcon-root': {
                  color: !importing ? theme.palette.primary.dark : theme.palette.divider,
                },
              },
            }}
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Box sx={{ position: 'relative' }}>
              <FolderZip
                fontSize={'large'}
                sx={{
                  color: !importing ? theme.palette.primary.main : theme.palette.divider,
                  mr: 2,
                }}
              />
              {importing && (
                <CircularProgress
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-23px',
                    marginLeft: '-29px',
                  }}
                />
              )}
            </Box>
            <Box>
              <Typography variant="body1">{dataset.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {dataset.description}
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      </TableCell>

      <TableCell align="center">{prettyBytes(dataset.size)}</TableCell>

      <TableCell>
        <VectorsConfigChip vectorsConfig={dataset.vectors} />
      </TableCell>

      <TableCell align="center">{dataset.vectorCount}</TableCell>
      <TableCell align="center">
        <Tooltip title="Import Dataset" arrow placement={'top'}>
          <IconButton onClick={() => setIsImportDialogOpen(true)}>
            <Download />
          </IconButton>
        </Tooltip>
      </TableCell>
      <ImportDatasetDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        content={`Enter collection name for ${dataset.fileName}`}
        fileName={dataset.fileName}
        actionHandler={importDataset}
        setImporting={setImporting}
        importing={importing}
      />
    </TableRow>
  );
};

DatasetsTableRow.propTypes = {
  dataset: PropTypes.shape({
    name: PropTypes.string,
    vectors: PropTypes.object,
    description: PropTypes.string,
    vectorCount: PropTypes.number,
    fileName: PropTypes.string,
    size: PropTypes.number,
  }),
  importDataset: PropTypes.func,
};
