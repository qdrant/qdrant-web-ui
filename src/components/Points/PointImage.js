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
        const isImage =
          data[key].indexOf(".jpg") > -1 ||
          data[key].indexOf(".png") > -1 ||
          (data[key].indexOf(".jpeg") > -1 &&
            (data[key].indexOf("http") > -1 ||
              data[key].indexOf("https") > -1));
        if (isImage) {
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
