import React from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

const CollectionCard = (props) => {
  const { collection } = props;

  function resDataView(data) {
    const Payload = Object.keys(data.payload).map((key) => {
      if (typeof data.payload[key] === "object") {
        return (
          <>
            <Box p={1} display={"flex"}>
              <Typography
                variant="subtitle1"
                display={"inline"}
                fontWeight={600}
              >
                {key} :
              </Typography>
              <JsonViewer value={data.payload[key]} />
            </Box>
            <Divider />
          </>
        );
      } else {
        return (
          <>
            <Box p={1}>
              <Typography
                variant="subtitle1"
                display={"inline"}
                fontWeight={600}
              >
                {key} :
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                display={"inline"}
              >
                {"\t"} {data.payload[key]}
              </Typography>
            </Box>
            <Divider />
          </>
        );
      }
    });

    return (
      <>
        <Box p={1}>
          <Typography variant="subtitle1" display="inline" fontWeight={600}>
            id :
          </Typography>
          <Typography
            variant="subtitle2"
            display="inline"
            color="text.secondary"
          >
            {"\t"} {data["id"] !== null ? data["id"] : "NULL"}
          </Typography>
        </Box>
        <Divider />
        {Payload}
      </>
    );
  }

  return (
    <>
      <Card
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <CardContent>{resDataView(collection)}</CardContent>
      </Card>
    </>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.object.isRequired,
};

export default CollectionCard;
