import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem, TableCell, TableContainer, TableRow } from '@mui/material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import { Link } from 'react-router-dom';
import DeleteDialog from './DeleteDialog';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Dot } from '../Common/Dot';
import ActionsMenu from '../Common/ActionsMenu';
import { useTheme } from '@mui/material/styles';

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
        <Typography color="black" component={StyledLink} to={`/collections/${collection.name}`}>
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
            <HeaderTableCell width="30%">Name</HeaderTableCell>
            <HeaderTableCell width="20%">Status</HeaderTableCell>
            <HeaderTableCell width="25%" align="center">
              Approximate Points Number
            </HeaderTableCell>
            <HeaderTableCell width="25%" align="center">
              Segments Number
            </HeaderTableCell>
            <HeaderTableCell align="right">Actions</HeaderTableCell>
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
