import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  MenuItem,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Table,
  TableBody,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import DeleteDialog from './DeleteDialog';
import ActionsMenu from '../Common/ActionsMenu';
import VectorsConfigChip from '../Common/VectorsConfigChip';
import CollectionStatus from './CollectionStatus';

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f7f8fa',
  borderRadius: '8px 8px 0 0',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderBottom: 'none',
});

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: '8px 16px',
  borderBottom: 'none',
  fontFamily: '"Mona Sans", sans-serif',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: 1.5,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  // todo: add border radius to the first and last cells
  '&:first-of-type': {
    borderRadius: '8px 0 0 0',
  },
  '&:last-of-type': {
    borderRadius: '0 8px 0 0',
  },
}));

const StyledTableBody = styled(TableBody)({
  backgroundColor: '#ffffff',
  borderRadius: '0 0 8px 8px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderTop: 'none',
});

const StyledTableRow = styled(TableRow)({
  height: '72px',
  padding: '16px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  '&:last-child': {
    borderBottom: 'none',
  },
  '& .MuiTableCell-root': {
    padding: '16px',
    borderBottom: 'none',
    fontFamily: '"Mona Sans", sans-serif',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#111824',
  },
});

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const CollectionTableRow = ({ collection, getCollectionsCall }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const theme = useTheme();

  return (
    <StyledTableRow>
      <TableCell>
        <Typography component={StyledLink} to={`/collections/${collection.name}`}>
          {collection.name}
        </Typography>
        <Typography component={'p'} variant="caption" color="text.secondary">
          {collection.aliases && collection.aliases.length > 0 && `Aliases: ${collection.aliases.join(', ')}`}
        </Typography>
      </TableCell>
      <TableCell>
        <CollectionStatus status={collection.status} collectionName={collection.name} />
      </TableCell>
      <TableCell align="center">
        <Typography component={StyledLink} to={`/collections/${collection.name}`}>
          {collection.points_count}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{collection.segments_count}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{collection.config.params.shard_number}</Typography>
      </TableCell>
      <TableCell>
        <VectorsConfigChip collectionConfigParams={collection.config.params} sx={{ justifyContent: 'center' }} />
      </TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem component={Link} to={`/collections/${collection.name}#snapshots`}>
            Take Snapshot
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${collection.name}/visualize`}>
            Visualize
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${collection.name}/graph`}>
            Graph
          </MenuItem>
          <MenuItem onClick={() => setOpenDeleteDialog(true)} sx={{ color: theme.palette.error.main }}>
            Delete
          </MenuItem>
        </ActionsMenu>
        <DeleteDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          collectionName={collection.name}
          getCollectionsCall={getCollectionsCall}
        />
      </TableCell>
    </StyledTableRow>
  );
};

CollectionTableRow.propTypes = {
  collection: PropTypes.object.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

const CollectionsList = ({ collections, getCollectionsCall }) => {
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell width="25%">Name</StyledHeaderCell>
            <StyledHeaderCell width="12%">Status</StyledHeaderCell>
            <StyledHeaderCell width="12%" align="center">
              Points (Approx)
            </StyledHeaderCell>
            <StyledHeaderCell width="12%" align="center">
              Segments
            </StyledHeaderCell>
            <StyledHeaderCell width="12%" align="center">
              Shards
            </StyledHeaderCell>
            <StyledHeaderCell width="20%" align="center">
              Vectors Configuration
              <br />
              (Name, Size, Distance)
            </StyledHeaderCell>
            <StyledHeaderCell width="7%" align="right">
              Actions
            </StyledHeaderCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {collections.length > 0 &&
            collections.map((collection) => (
              <CollectionTableRow
                key={collection.name}
                collection={collection}
                getCollectionsCall={getCollectionsCall}
              />
            ))}
        </StyledTableBody>
      </Table>
    </TableContainer>
  );
};

CollectionsList.propTypes = {
  collections: PropTypes.array.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

export default CollectionsList;
