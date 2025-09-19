import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Chip, TableCell, Tooltip, Button } from '@mui/material';
import { ArchiveRestore, CircleX, Download, Trash } from 'lucide-react';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CircularProgressWithLabel from '../Common/CircularProgressWithLabel';
import { useClient } from '../../context/client-context';
import { StyledTableRow } from '../Common/StyledTable';

export const SnapshotsTableRow = ({ snapshot, downloadSnapshot, deleteSnapshot }) => {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <StyledTableRow key={snapshot.name}>
      <TableCell width={'60%'}>
        <Tooltip title={'Download snapshot'} arrow placement={'top'}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              cursor: progress === 0 ? 'pointer' : 'default',
              '&:hover': {
                textDecoration: progress === 0 ? 'underline' : 'none',
                '& .MuiSvgIcon-root': {
                  color: progress === 0 ? theme.palette.primary.dark : theme.palette.divider,
                },
              },
            }}
            onClick={() => downloadSnapshot(snapshot.name, snapshot.size, progress, setProgress)}
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
                }}
              >
                <ArchiveRestore
                  size={16}
                  color={progress === 0 ? theme.palette.secondary.main : theme.palette.divider}
                />
              </Box>
              {progress > 0 && (
                <CircularProgressWithLabel
                  value={progress}
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
            {snapshot.name}
          </Box>
        </Tooltip>
        {progress > 0 && (
          <Chip
            label={`Preparing download`}
            size="small"
            sx={{ ml: 3, mb: '2px' }}
            deleteIcon={
              <Tooltip title={'Cancel download'} placement={'right'}>
                <CircleX size={16} />
              </Tooltip>
            }
            onDelete={() => {
              qdrantClient.abortDownload();
              setProgress(0);
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">{snapshot.creation_time || 'unknown'}</TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {prettyBytes(snapshot.size)}
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={18} />}
            onClick={() => downloadSnapshot(snapshot.name, snapshot.size, progress, setProgress)}
            sx={{
              px: '10px',
              py: '4px',
            }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Trash size={18} />}
            onClick={() => setIsDeleteDialogOpen(true)}
            sx={{
              px: '10px',
              py: '4px',
            }}
          >
            Delete
          </Button>
        </Box>
      </TableCell>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title={'Delete snapshot'}
        content={`Are you sure you want to delete snapshot ${snapshot.name}?`}
        warning={`This action cannot be undone.`}
        actionName={'Delete'}
        actionHandler={() => deleteSnapshot(snapshot.name)}
      />
    </StyledTableRow>
  );
};

SnapshotsTableRow.propTypes = {
  snapshot: PropTypes.shape({
    name: PropTypes.string,
    creation_time: PropTypes.string,
    size: PropTypes.number,
  }),
  downloadSnapshot: PropTypes.func,
  deleteSnapshot: PropTypes.func,
};
