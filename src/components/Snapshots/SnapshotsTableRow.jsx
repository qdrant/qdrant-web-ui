import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, ListItemIcon, MenuItem, TableCell, TableRow, Tooltip } from '@mui/material';
import { CancelOutlined, Delete, Download, FolderZip } from '@mui/icons-material';
import ActionsMenu from '../Common/ActionsMenu';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CircularProgressWithLabel from '../Common/CircularProgressWithLabel';
import { useClient } from '../../context/client-context';

export const SnapshotsTableRow = ({ snapshot, downloadSnapshot, deleteSnapshot }) => {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <TableRow key={snapshot.name}>
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
              <FolderZip
                fontSize={'large'}
                sx={{
                  color: progress === 0 ? theme.palette.primary.main : theme.palette.divider,
                  mr: 2,
                }}
              />
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
                <CancelOutlined fontSize="small" />
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
      <TableCell align="center">{prettyBytes(snapshot.size)}</TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem onClick={() => downloadSnapshot(snapshot.name, snapshot.size, progress, setProgress)}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            Download
          </MenuItem>
          <MenuItem
            sx={{
              color: theme.palette.error.main,
            }}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <ListItemIcon>
              <Delete color="error" fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </ActionsMenu>
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
    </TableRow>
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
