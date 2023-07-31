import React, { useState } from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { useTheme } from '@mui/material/styles';
import { Box, ListItemIcon, MenuItem, TableCell, TableRow, Tooltip } from '@mui/material';
import { Delete, Download, FolderZip } from '@mui/icons-material';
import ActionsMenu from '../Common/ActionsMenu';
import ConfirmationDialog from '../Common/ConfirmationDialog';

export const SnapshotsTableRow = ({ snapshot, downloadSnapshot, deleteSnapshot }) => {
  const theme = useTheme();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <TableRow key={snapshot.name}>
      <TableCell>
        <Tooltip title={'Download snapshot'} arrow placement={'top'}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
                '& svg': {
                  color: theme.palette.primary.dark,
                },
              },
            }}
            onClick={() => downloadSnapshot(snapshot.name)}
          >
            <FolderZip fontSize={'large'} sx={{ color: theme.palette.primary.main, mr: 2 }} />
            {snapshot.name}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell align="center">{snapshot.creation_time || 'unknown'}</TableCell>
      <TableCell align="center">{prettyBytes(snapshot.size)}</TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem onClick={() => downloadSnapshot(snapshot.name)}>
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
