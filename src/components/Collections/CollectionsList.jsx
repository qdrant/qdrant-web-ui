import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Box, MenuItem, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import { Dot } from '../Common/Dot';
import DeleteDialog from './DeleteDialog';
import ActionsMenu from '../Common/ActionsMenu';
import VectorsConfigChip from '../Common/VectorsConfigChip';

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
    <TableRow>
      <TableCell>
        <Typography component={StyledLink} to={`/collections/${collection.name}`}>
          {collection.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Box
          sx={{ display: 'inline-flex', alignItems: 'center' }}
          component={StyledLink}
          to={`/collections/${collection.name}#info`}
        >
          <Dot color={collection.status} />
          <Typography sx={{ ml: 1 }}>{collection.status}</Typography>
        </Box>
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
    </TableRow>
  );
};

CollectionTableRow.propTypes = {
  collection: PropTypes.object.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

const HeaderTableCell = styled(TableCell)`
  font-weight: bold;
`;

const CollectionsList = ({ collections, getCollectionsCall }) => {
  return (
    <TableContainer>
      <TableWithGaps aria-label="simple table">
        <TableHeadWithGaps>
          <TableRow>
            <HeaderTableCell width="25%">Name</HeaderTableCell>
            <HeaderTableCell width="12%">Status</HeaderTableCell>
            <HeaderTableCell width="12%" align="center">
              Points (Approx)
            </HeaderTableCell>
            <HeaderTableCell width="12%" align="center">
              Segments
            </HeaderTableCell>
            <HeaderTableCell width="12%" align="center">
              Shards
            </HeaderTableCell>
            <HeaderTableCell width="20%" align="center">
              Vectors Configuration
              <br />
              (Name, Size, Distance)
            </HeaderTableCell>
            <HeaderTableCell width="7%" align="right">
              Actions
            </HeaderTableCell>
          </TableRow>
        </TableHeadWithGaps>
        <TableBodyWithGaps>
          {collections.length > 0 &&
            collections.map((collection) => (
              <CollectionTableRow
                key={collection.name}
                collection={collection}
                getCollectionsCall={getCollectionsCall}
              />
            ))}
        </TableBodyWithGaps>
      </TableWithGaps>
    </TableContainer>
  );
};

CollectionsList.propTypes = {
  collections: PropTypes.array.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

export default CollectionsList;
