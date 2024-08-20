import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, TableCell, TableContainer, TableRow } from '@mui/material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import { Link } from 'react-router-dom';
import DeleteDialog from './DeleteDialog';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { Dot } from '../Common/Dot';
import { Grain, Polyline } from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const CollectionTableRow = ({ collection, getCollectionsCall }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  console.log(collection);
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
        {/* todo: this is for multiple buttons, reconsider if there will be only one */}
        <Grid container spacing={2} justifyContent="right">
          <Grid item>
            <Tooltip title={'Take Snapshot'} placement="left">
              <IconButton component={Link} to={`/collections/${collection.name}#snapshots`}>
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Visualize Collection'} placement="left">
              <IconButton component={Link} to={`/collections/${collection.name}/visualize`}>
                <Grain />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Collection Graph'} placement="left">
              <IconButton component={Link} to={`/collections/${collection.name}/graph`}>
                <Polyline />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={'Delete Collection'} placement="left">
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
            <HeaderTableCell width="10%">Status</HeaderTableCell>
            <HeaderTableCell width="25%" align="center">
              Approximate Points Number
            </HeaderTableCell>
            <HeaderTableCell width="20%" align="center">
              Segments Number
            </HeaderTableCell>
            <HeaderTableCell align="right">Actions</HeaderTableCell>
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
