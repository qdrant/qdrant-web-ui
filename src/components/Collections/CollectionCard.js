import React ,{useState}from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Divider, Stack, CardActionArea, Typography, styled, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PolylineIcon from '@mui/icons-material/Polyline';
import { deleteCollections } from '../../common/client';
import ErrorNotifier from "../ToastNotifications/ErrorNotifier"

const CollectionCard = (props) => {
  const { collection, getCollectionsCall} = props;
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function  callDelete() {
    const response= await deleteCollections(collection.name);
    if (response===true){
       getCollectionsCall();
    }
    else{
      setErrorMessage(`Deletion Unsuccessful, Check Server!!`)
      setHasError(true)
    }
  }

  return (
    <>
      {hasError && <ErrorNotifier {...{ message: errorMessage, setHasError }} />}
    <Card
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <CardActionArea component={Link} to={`/collections/${collection.name}`}>
        <CardContent>
          <Typography
            align="center"
            
            variant="h5"
          >
            {collection.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 1 }}
      >
        <Button variant="body" component={Link} to={`/collections/${collection.name}/vector`} size={"small"} startIcon={<PolylineIcon />}>
          visualize
        </Button>
        <Button variant="body" size={"small"}  onClick={callDelete} startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </Stack>
    </Card>
    </>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.object.isRequired,
  getCollectionsCall:PropTypes.func.isRequired
};

export default CollectionCard;