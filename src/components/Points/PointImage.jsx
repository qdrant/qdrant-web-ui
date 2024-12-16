import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CardMedia, Grid, Modal, Typography } from '@mui/material';

function PointImage({ data, sx, gridxs }) {
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const renderImages = () => {
    const images = [];

    function isImgUrl(string) {
      let url;
      try {
        url = new URL(string);
      } catch (_) {
        return false;
      }
      if (url) {
        return /\.(jpg|jpeg|png|webp|gif|svg)$/.test(url.pathname);
      }
      return false;
    }

    // Loop through the object's properties
    for (const key in data) {
      if (typeof data[key] == 'string') {
        // Check if the value is an image URL
        if (isImgUrl(data[key])) {
          images.push(
            <CardMedia
              component="img"
              sx={{
                width: 150,
                margin: 'auto',
                padding: 1,
                wordWrap: 'break-word',
                p: 1,
                border: '1px solid #ccc',
                borderRadius: '5px',
                ...sx,
              }}
              key={key}
              image={data[key]}
              alt={data[key]}
              onClick={() => setFullScreenImg(data[key])}
            />
          );
        }
      }
    }

    return images;
  };

  const images = renderImages();

  if (images.length === 0) {
    return null;
  }

  return (
    <Grid item xs={gridxs ?? 3} display="grid" justifyContent={'center'}>
      {images}
      <Modal
        open={!!fullScreenImg}
        onClose={() => setFullScreenImg(null)}
        componentsProps={{
          backdrop: {
            sx: { cursor: 'pointer' },
            title: 'Click to close',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            maxWidth: '100%',
            maxHeight: '100%',
            '&:focus': { outline: 'none' },
          }}
        >
          <Typography
            variant="h6"
            component="p"
            onClick={() => setFullScreenImg(null)}
            sx={{
              position: 'absolute',
              top: '-60px',
              right: 0,
              padding: 1,
              cursor: 'pointer',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '5px',
            }}
          >
            Close [ESC]
          </Typography>
          <img
            src={fullScreenImg}
            alt={fullScreenImg}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </Box>
      </Modal>
    </Grid>
  );
}
PointImage.propTypes = {
  data: PropTypes.object.isRequired,
  sx: PropTypes.object,
  gridxs: PropTypes.number,
};

export default PointImage;
