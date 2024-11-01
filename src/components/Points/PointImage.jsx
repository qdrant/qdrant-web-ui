import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CardMedia, Modal, Typography } from '@mui/material';

function PointImage({ data, sx }) {
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = [];
      for (const key in data) {
        if (typeof data[key] === 'string') {
          try {
            const url = new URL(data[key]);
            if (/\.(jpg|jpeg|png|webp|gif|svg)$/.test(url.pathname)) {
              urls.push({ key, url: data[key] });
              continue;
            }
            const response = await fetch(url, { method: 'HEAD' });
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              urls.push({ key, url: data[key] });
            }
          } catch (_) {
            // Ignore invalid URLs
          }
        }
      }
      setImageUrls(urls);
    };

    fetchImageUrls();
  }, [data]);

  const renderImages = () => {
    return imageUrls.map(({ key, url }) => (
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
        image={url}
        alt={url}
        onClick={() => setFullScreenImg(url)}
      />
    ));
  };

  const images = renderImages();

  if (images.length === 0) {
    return null;
  }

  return (
    <>
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
    </>
  );
}
PointImage.propTypes = {
  data: PropTypes.object.isRequired,
  sx: PropTypes.object,
};

export default PointImage;
