import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, ListItemIcon, MenuItem, TableCell, TableRow, Tooltip } from '@mui/material';
import { Delete, Download, FolderZip } from '@mui/icons-material';
import ActionsMenu from '../Common/ActionsMenu';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CircularProgressWithLabel from '../Common/CircularProgressWithLabel';

export const SnapshotsTableRow = ({ snapshot, downloadSnapshot, deleteSnapshot, progress }) => {
  const theme = useTheme();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <TableRow key={snapshot.name}>
      <TableCell width={'60%'}>
        <Tooltip title={'Download snapshot'} arrow placement={'top'}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
                pointerEvents: progress > 0 ? 'none' : 'auto',
                '& svg': {
                  color: theme.palette.primary.dark,
                },
              },
            }}
            onClick={() => downloadSnapshot(snapshot.name, snapshot.size)}
          >
            <Box sx={{ position: 'relative' }}>
              <FolderZip
                fontSize={'large'}
                sx={{
                  color: progress > 0 ? theme.palette.divider : theme.palette.primary.main,
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
            {progress > 0 && <Chip label={`Preparing download`} size="small" sx={{ ml: 3 }} />}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell align="center">{snapshot.creation_time || 'unknown'}</TableCell>
      <TableCell align="center">{prettyBytes(snapshot.size)}</TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem onClick={() => downloadSnapshot(snapshot.name, snapshot.size)}>
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
  progress: PropTypes.number,
};
