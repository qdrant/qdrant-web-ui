import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Grid,
  CardActions,
  Button,
} from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

const PointCard = (props) => {
  const { point, setRecommendationIds } = props;
  function resDataView(data) {
    const Payload = Object.keys(data.payload).map((key) => {
      return (
        <div key={key}>
          <Grid container spacing={2}>
            <Grid item xs={2} my={1}>
              <Typography
                variant="subtitle1"
                display={"inline"}
                fontWeight={600}
              >
                {key}
              </Typography>
            </Grid>

            <Grid item xs={10} my={1}>
              {typeof data.payload[key] === "object" ? (
                <Typography variant="subtitle1">
                  {" "}
                  <JsonViewer
                    value={data.payload[key]}
                    displayDataTypes={false}
                    defaultInspectDepth={0}
                    rootName={false}
                  />{" "}
                </Typography>
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
        </div>
      );
    });

    return (
      <>
        <Grid container spacing={2}>
          <Grid item xs={2} my={1}>
            <Typography variant="subtitle1" display="inline" fontWeight={600}>
              id
            </Typography>
          </Grid>
          <Grid item xs={10} my={1}>
            <Typography
              variant="subtitle1"
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
    <Card
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent>{resDataView(point)}</CardContent>
      <CardActions
        sx={{
          justifyContent: "right",
        }}
      >
        <Button
          size="small"
          onClick={() => {
            setRecommendationIds([point.id]);
          }}
        >
          Find Similiar
        </Button>
      </CardActions>
    </Card>
  );
};

PointCard.propTypes = {
  point: PropTypes.object.isRequired,
  setRecommendationIds: PropTypes.func.isRequired,
};

export default PointCard;
