import React from "react";
import PropTypes from "prop-types";
import { CardMedia } from "@mui/material";

function PointImage({ data }) {
  const renderImages = () => {
    const images = [];

    // Loop through the object's properties
    for (const key in data) {
      if (typeof data[key] == "string") {
        // Check if the value is an image URL
          function isImgUrl(string) {
            let url;
            try {
                url = new URL(string);
              } catch (_) {
                return false;
            }
            if(url){
                return /\.(jpg|jpeg|png)$/.test(url.pathname)
            }
            return false;
          }
        if (isImgUrl(data[key]) ) {
          images.push(
            <CardMedia
              component="img"
              sx={{
                width: 150,
                margin: "auto",
                wordWrap: "break-word",
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
};

export default PointImage;