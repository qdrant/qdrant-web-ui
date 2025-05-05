import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardActionArea, CardContent, Dialog, Grid, Typography } from '@mui/material';
import { getErrorMessage } from '../../lib/get-error-message';
// import PointCard from '../Points/PointCard';
import PointsTabs from '../Points/PointsTabs';
// import ErrorIcon from '@mui/icons-material/Error';

const CallScrollRequest = (props) => {
  const { client, collection } = props;
  const [errorMessage, setErrorMessage] = useState(null);
  const [points, setPoints] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getPoints = async () => {
      try {
        const newPoints = await client.scroll(collection, {
          limit: 10,
        });
        setPoints({
          points: [...(newPoints?.points || [])],
        });
        // console.log(newPoints);
        // setErrorMessage('Error: You do not have permission to view this collection');
      } catch (error) {
        const message = getErrorMessage(error, { withApiKey: { apiKey: client.getApiKey() } });
        message && setErrorMessage(message);
        setPoints({});
      }
    };
    return () => {
      getPoints({});
    };
  }, []);

  return (
    <Grid size={12}>
      <Card variant="dual">
        <CardActionArea>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography gutterBottom variant="h5" component="div" width={1200}>
                {collection}
              </Typography>
              {errorMessage && (
                <Typography variant="body2" color="red" left={'kk'}>
                  {errorMessage}
                </Typography>
              )}
              {points && points.points && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {points.points.length} points
                  </Typography>

                  <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="small">
                    View points
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      <Dialog open={open} fullScreen onClose={handleClose} aria-labelledby="View points" aria-describedby="View points">
        <Box padding={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 3 }}>
            <Typography variant="h5" component="div">
              View points in collection {collection}
            </Typography>
            <Button onClick={handleClose} color="error" variant="outlined">
              Close
            </Button>
          </Box>
          <PointsTabs collectionName={collection} client={client} />
        </Box>
      </Dialog>
    </Grid>
  );
};

CallScrollRequest.propTypes = {
  client: PropTypes.object,
  collection: PropTypes.string,
};

export default CallScrollRequest;
