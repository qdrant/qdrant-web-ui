import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Checkbox, MenuItem, TableCell, TableRow, Typography, Table } from '@mui/material';
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
import { CopyableGroupedNumber } from '../Common/CopyableGroupedNumber';

const CollectionTableRow = ({
  collection,
  getCollectionsCall,
  refreshCollection,
  isRefreshing,
  isSelected,
  onToggleSelect,
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const theme = useTheme();

  return (
    <StyledTableRow selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect(collection.name)}
          inputProps={{ 'aria-label': `Select collection ${collection.name}` }}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography component={StyledLink} to={`/collections/${encodeURIComponent(collection.name)}`}>
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
        <Typography component={StyledLink} to={`/collections/${encodeURIComponent(collection.name)}`}>
          <CopyableGroupedNumber value={collection.points_count} />
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{collection.segments_count}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography>{collection.config.params.shard_number}</Typography>
      </TableCell>
      <TableCell align="center">
        <VectorsConfigChips collectionConfigParams={collection.config.params} collectionName={collection.name} />
      </TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem component={Link} to={`/collections/${encodeURIComponent(collection.name)}#snapshots`}>
            Snapshots
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${encodeURIComponent(collection.name)}/visualize`}>
            Visualize
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${encodeURIComponent(collection.name)}/graph`}>
            Graph
          </MenuItem>
          <MenuItem onClick={() => refreshCollection(collection.name)} disabled={isRefreshing}>
            Refresh
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
  refreshCollection: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggleSelect: PropTypes.func.isRequired,
};

const CollectionsList = ({
  collections,
  getCollectionsCall,
  refreshCollection,
  isRefreshing,
  selectedCollections,
  handleToggleSelect,
  handleSelectAll,
}) => {
  const allSelected = collections.length > 0 && collections.every((c) => selectedCollections.has(c.name));
  const someSelected = collections.some((c) => selectedCollections.has(c.name));

  return (
    <StyledTableContainer>
      <Table aria-label="simple table">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={() => handleSelectAll(collections)}
                inputProps={{ 'aria-label': 'Select all collections on this page' }}
                size="small"
              />
            </StyledHeaderCell>
            <StyledHeaderCell width="25%">Name</StyledHeaderCell>
            <StyledHeaderCell width="12%">Status</StyledHeaderCell>
            <StyledHeaderCell align="center">Points (Approx)</StyledHeaderCell>
            <StyledHeaderCell align="center">Segments</StyledHeaderCell>
            <StyledHeaderCell align="center">Shards</StyledHeaderCell>
            <StyledHeaderCell width="20%" align="center">
              Vectors Config
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
                refreshCollection={refreshCollection}
                isRefreshing={isRefreshing}
                isSelected={selectedCollections.has(collection.name)}
                onToggleSelect={handleToggleSelect}
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
  refreshCollection: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  selectedCollections: PropTypes.instanceOf(Set).isRequired,
  handleToggleSelect: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
};

export default CollectionsList;
