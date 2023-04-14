import React from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

const CollectionCard = (props) => {
  const { collection } = props;

  function formatJSON(res = {}) {
    try {
      return JSON.stringify(res, null, 2);
    } catch {
      const errorJson = {
        error: `HERE ${val}`,
      };
      return JSON.stringify(errorJson, null, 2);
    }
  }

  function resDataView(data) {
    const Payload = Object.keys(data.payload).map((key) => {
      return (
        <>
          <Box p={1} sx={{ display: "flex" }}>
            <Typography variant="subtitle1" display="inline" fontWeight={600}>
              {key} :
            </Typography>
            {"\t"}{" "}
            {typeof data.payload[key] === "object" ? (
              <JsonViewer value={data.payload[key]} />
            ) : (
              <Typography
                variant="subtitle2"
                display="inline"
                color="text.secondary"
              >
                {" "}
                {data.payload[key]}
              </Typography>
            )}
          </Box>
          <Divider />
        </>
      );
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
