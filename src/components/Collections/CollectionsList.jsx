import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MenuItem, TableCell, TableRow, Typography, Table } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
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

const CollectionTableRow = ({ collection, getCollectionsCall, refreshCollection, isRefreshing }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <StyledTableRow>
      <TableCell>
        <Typography component={StyledLink} to={`/collections/${encodeURIComponent(collection.name)}`}>
          {collection.name}
        </Typography>
        <Typography component={'p'} variant="caption" color="text.secondary">
          {collection.aliases && collection.aliases.length > 0 && `${t('collections.aliases')}: ${collection.aliases.join(', ')}`}
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
            {t('collection.snapshots')}
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${encodeURIComponent(collection.name)}/visualize`}>
            {t('collection.visualize')}
          </MenuItem>
          <MenuItem component={Link} to={`/collections/${encodeURIComponent(collection.name)}/graph`}>
            {t('collection.graph')}
          </MenuItem>
          <MenuItem onClick={() => refreshCollection(collection.name)} disabled={isRefreshing}>
            {t('collection.refreshCollectionInfo')}
          </MenuItem>
          <MenuItem onClick={() => setOpenDeleteDialog(true)} sx={{ color: theme.palette.error.main }}>
            {t('delete.delete')}
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
};

const CollectionsList = ({ collections, getCollectionsCall, refreshCollection, isRefreshing }) => {
  const { t } = useTranslation();

  return (
    <StyledTableContainer>
      <Table aria-label="simple table">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell width="25%">{t('collections.name')}</StyledHeaderCell>
            <StyledHeaderCell width="12%">{t('collections.status')}</StyledHeaderCell>
            <StyledHeaderCell align="center">{t('collections.pointsApprox')}</StyledHeaderCell>
            <StyledHeaderCell align="center">{t('collections.segments')}</StyledHeaderCell>
            <StyledHeaderCell align="center">{t('collections.shards')}</StyledHeaderCell>
            <StyledHeaderCell width="20%" align="center">
              {t('collections.vectorsConfig')}
            </StyledHeaderCell>
            <StyledHeaderCell width="7%" align="right">
              {t('collections.actions')}
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
};

export default CollectionsList;
