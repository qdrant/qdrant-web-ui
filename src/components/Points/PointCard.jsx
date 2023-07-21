import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Grid,
  CardHeader,
  Snackbar,
  Alert,
} from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";
import PointImage from "./PointImage";
import { alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CopyAll } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Vectors from "./PointVectors";

const PointCard = (props) => {
  const theme = useTheme();
  const { point, setRecommendationIds } = props;
  const [openTooltip, setOpenTooltip] = React.useState(false);

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
                    theme={theme.palette.mode}
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
                  {"\t"} {data.payload[key].toString()}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Divider/>
        </div>
      );
    });

    return <>{Payload}</>;
  }

  return (
    <>
      <Card
        variant="dual"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <CardHeader
          title={"Point " + point.id}
          action={
            <Tooltip title="Copy JSON" placement="right">
              <IconButton
                aria-label="copy point"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(point));
                  setOpenTooltip(true);
                }}>
                <CopyAll/>
              </IconButton>
            </Tooltip>
          }
        />
        <CardHeader subheader={"Payload:"} sx={{
          flexGrow: 1,
          background: alpha(theme.palette.primary.main, 0.05),
        }}/>
        <CardContent>
          <Grid container display={"flex"}>
            <Grid item xs my={1}>
              {resDataView(point)}
            </Grid>
            {point.payload.images &&
              <Grid item xs={3} display="grid" justifyContent={"center"}>
                <PointImage data={point.payload} sx={{ ml: 2 }}/>
              </Grid>
            }
          </Grid>
        </CardContent>
        <CardHeader subheader={"Vectors:"} sx={{
          flexGrow: 1,
          background: alpha(theme.palette.primary.main, 0.05),
        }}/>
        <CardContent>
          {point?.vector &&
            <Vectors
              point={point}
              setRecommendationIds={setRecommendationIds}/>
          }
        </CardContent>
      </Card>
      <Snackbar
        open={openTooltip}
        severity="success"
        autoHideDuration={3000}
        onClose={() => setOpenTooltip(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Point JSON copied to clipboard.
        </Alert>
      </Snackbar>
    </>
  );
};

PointCard.propTypes = {
  point: PropTypes.object.isRequired,
  setRecommendationIds: PropTypes.func.isRequired,
};

export default PointCard;