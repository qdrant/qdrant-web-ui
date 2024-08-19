import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, TableCell, TableContainer, TableRow } from '@mui/material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import { Link } from 'react-router-dom';
import DeleteDialog from './DeleteDialog';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const CollectionTableRow = ({ collection, getCollectionsCall }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  return (
    <TableRow>
      <TableCell>
        <Typography component={StyledLink} to={`/collections/${collection.name}`}>
          {collection.name}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {/* todo: this is for multiple buttons, reconsider if there will be only one */}
        <Grid container spacing={2} justifyContent="right">
          <Grid item>
            <Tooltip title={'Delete collection'} placement="left">
              <IconButton onClick={() => setOpenDeleteDialog(true)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
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

const StyledTableCell = styled(TableCell)`
  font-weight: bold;
`;

const CollectionsList = ({ collections, getCollectionsCall }) => {
  return (
    <TableContainer>
      <TableWithGaps aria-label="simple table">
        <TableHeadWithGaps>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell align="right">Action</StyledTableCell>
          </TableRow>
        </TableHeadWithGaps>
        <TableBodyWithGaps>
          {collections.map((collection) => (
            <CollectionTableRow key={collection.id} collection={collection} getCollectionsCall={getCollectionsCall} />
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
