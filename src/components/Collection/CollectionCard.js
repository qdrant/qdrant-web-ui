import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Grid,
} from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

const CollectionCard = (props) => {
  const { collection } = props;

  function resDataView(data) {
    const Payload = Object.keys(data.payload).map((key) => {
      return (
        <>
          <Grid container spacing={2}>
            <Grid item xs={2} my={1}>
              <Typography
                variant="subtitle1"
                display={"inline"}
                fontWeight={600}
              >
                {key} :
              </Typography>
            </Grid>

            <Grid item xs={10} my={1}>
              {typeof data.payload[key] === "object" ? (
                <JsonViewer value={data.payload[key]} />
              ) : (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  display={"inline"}
                >
                  {"\t"} {data.payload[key]}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Divider />
        </>
      );
    });

    return (
      <>
        <Grid container spacing={2}>
          <Grid item xs={2} my={1}>
            <Typography variant="subtitle1" display="inline" fontWeight={600}>
              id :
            </Typography>
          </Grid>
          <Grid item xs={10} my={1}>
            <Typography
              variant="subtitle2"
              display="inline"
              color="text.secondary"
            >
              {data["id"] !== null ? data["id"] : "NULL"}
            </Typography>
          </Grid>
        </Grid>
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
