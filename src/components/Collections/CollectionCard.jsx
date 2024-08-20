import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Divider, Stack, CardActionArea, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PolylineIcon from '@mui/icons-material/Polyline';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useClient } from '../../context/client-context';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';

const CollectionCard = (props) => {
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const { collection, getCollectionsCall } = props;
  const { client: qdrantClient } = useClient();
  const { errorMessage, setErrorMessage } = useState(null);

  async function callDelete() {
    try {
      await qdrantClient.deleteCollection(collection.name);
      getCollectionsCall();
      setOpenDeleteDialog(false);
    } catch (error) {
      setErrorMessage(`Deletion Unsuccessful, error: ${error.message}`);
      setOpenDeleteDialog(false);
    }
  }

  return (
    <>
      {errorMessage && <ErrorNotifier message={errorMessage} />}
      <Card
        variant="dual"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <CardActionArea component={Link} to={`/collections/${collection.name}`}>
          <CardContent>
            <Typography align="center" variant="h5">
              {collection.name}
            </Typography>
          </CardContent>
        </CardActionArea>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1 }}>
          {/* temporary disabled */}
          {false && (
            <Button
              variant="body"
              component={Link}
              to={`/collections/${collection.name}/visualize`}
              size={'small'}
              startIcon={<PolylineIcon />}
            >
              visualize
            </Button>
          )}
          <Button variant="body" size={'small'} onClick={() => setOpenDeleteDialog(true)} startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </Stack>
      </Card>
      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title={`Delete collection ${collection.name}`}
        content={`Are you sure you want to delete collections with name ${collection.name}?`}
        warning={`This action cannot be undone.`}
        actionName={'Delete'}
        actionHandler={() => callDelete()}
      />
    </>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.object.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};

export default CollectionCard;
