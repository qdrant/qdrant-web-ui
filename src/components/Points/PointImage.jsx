import React from 'react';
import PropTypes from 'prop-types';
import { CardMedia } from '@mui/material';

function PointImage({ data, sx }) {
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
        return /\.(jpg|jpeg|png)$/.test(url.pathname);
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
            />
          );
        }
      }
    }

    return images;
  };

  return <>{renderImages()}</>;
}
PointImage.propTypes = {
  data: PropTypes.object.isRequired,
  sx: PropTypes.object,
};

export default PointImage;
