import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, CircularProgress, TableCell, Tooltip, Typography, Button } from '@mui/material';
import { StyledTableRow } from '../Common/StyledTable';
import { ArchiveRestore, Upload } from 'lucide-react';
import ImportDatasetDialog from './ImportDatasetDialog';
import VectorsConfigChips from '../Common/VectorsConfigChips';

export const DatasetsTableRow = ({ dataset, importDataset }) => {
  const theme = useTheme();
  const [importing, setImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <StyledTableRow key={dataset.name} align={'center'}>
      <TableCell width={'50%'}>
        <Tooltip title={'Import Dataset'} arrow placement={'top'}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              cursor: importing ? 'default' : 'pointer',
              textDecorationThickness: '1px',
              textUnderlineOffset: '2px',
              '&:hover': {
                textDecoration: !importing ? 'underline' : 'none',
                textDecorationThickness: '1px',
                '& .MuiSvgIcon-root': {
                  color: !importing ? theme.palette.primary.dark : theme.palette.divider,
                },
              },
            }}
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.secondary.main, 0.16),
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  marginRight: '0.5rem',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '2px',
                  '&:hover': {
                    textDecorationThickness: '1px',
                  },
                }}
              >
                <ArchiveRestore size={16} color={!importing ? theme.palette.secondary.main : theme.palette.divider} />
              </Box>
              {importing && (
                <CircularProgress
                  size={16}
                  color={theme.palette.secondary.main}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-8px',
                    marginLeft: '-12px',
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

      <TableCell align="center">
        <VectorsConfigChips collectionConfigParams={dataset} collectionName={dataset.name} />
      </TableCell>

      <TableCell align="center">{dataset.vectorCount}</TableCell>
      <TableCell align="center">
        <Tooltip title="Import Dataset" arrow placement={'top'}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Upload size={18} />}
            onClick={() => setIsImportDialogOpen(true)}
            disabled={importing}
          >
            Import
          </Button>
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
    </StyledTableRow>
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
