import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MenuItem, TableCell, TableRow, Typography, Table } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead,
  StyledHeaderCell,
  StyledTableRow,
  StyledLink,
} from '../Common/StyledTable';
import DeleteDialog from './DeleteDialog';
import ActionsMenu from '../Common/ActionsMenu';
import CollectionStatus from './CollectionStatus';
import VectorsConfigChips from '../Common/VectorsConfigChips';

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
        <VectorsConfigChips collectionConfigParams={collection.config.params} collectionName={collection.name} />
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
    <StyledTableContainer>
      <Table aria-label="simple table">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell width="25%">Name</StyledHeaderCell>
            <StyledHeaderCell width="12%">Status</StyledHeaderCell>
            <StyledHeaderCell align="center">Points (Approx)</StyledHeaderCell>
            <StyledHeaderCell align="center">Segments</StyledHeaderCell>
            <StyledHeaderCell align="center">Shards</StyledHeaderCell>
            <StyledHeaderCell width="20%" align="center">
              Vectors Config
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
    </StyledTableContainer>
  );
};

CollectionsList.propTypes = {
  collections: PropTypes.array.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

export default CollectionsList;
