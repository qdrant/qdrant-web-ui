import { Card, CardContent, Divider, Typography, Grid } from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";
import { PointImage } from "./PointImage";

type PointCardProps = {
  point: any;
};

type PointDataViewProps = {
  data: {
    id: string;
    payload: Record<string, any>;
  };
};

export function PointDataView({ data }: PointDataViewProps) {
  const Payload = Object.keys(data.payload).map((key) => {
    return (
      <div key={key}>
        <Grid container spacing={2}>
          <Grid item xs={2} my={1}>
            <Typography variant="subtitle1" display={"inline"} fontWeight={600}>
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
export const PointCard = (props: PointCardProps) => {
  const { point } = props;

  return (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={2} m={"auto"}>
          <PointImage data={point.payload} />
        </Grid>
        <Grid item xs={10} my={1}>
          <CardContent>
            <PointDataView data={point} />
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};
