import React, { memo, useEffect } from "react";
import PropTypes from "prop-types";
import { JsonViewer } from "@textea/json-viewer";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useClient } from "../../context/client-context";

export const CollectionInfo = ({ collectionName }) => {
  console.log("render CollectionInfo");
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [collection, setCollection] = React.useState({});

  useEffect(() => {
    console.log("useEffect CollectionInfo");
    // loading state (global context?)
    qdrantClient.getCollection(collectionName).then((res) => {
      console.log(res);
      setCollection(() => {
        return { ...res };
      });
    }).catch((err) => {
      console.log(err);
      // snackbar error
    });
    setCollection(() => {
        return { "name": "test" };
      },
    );
  }, []);

  const rows = collection && Object.keys(collection).map((key) => {
    return (
      <React.Fragment key={key}>
        <Grid container spacing={2}>
          <Grid item xs={3} my={1}>
            <Typography variant="subtitle1" display={"inline"} fontWeight={600}
                        sx={{ wordBreak: "break-word" }}>
              {key}
            </Typography>
          </Grid>
          <Grid item xs={9} my={1}>
            {typeof collection[key] === "object"
              ?
              <JsonViewer
                theme={theme.palette.mode}
                value={collection[key]}
                displayDataTypes={false}
                defaultInspectDepth={0}
                rootName={false}
                editable={true}
                onChange={(path, oldValue, newValue) => {
                  console.log({ path, oldValue, newValue });
                }
                }
              />
              :
              <Typography variant="subtitle1" color="text.secondary"
                          display={"inline"}>
                {"\t"} {collection[key].toString()}
              </Typography>
            }
          </Grid>
        </Grid>
        <Divider/>
      </React.Fragment>
    );
  });

  return (
    <Box pt={2}>
      <Card variant="dual">
        <CardContent>
          {rows}
        </CardContent>
      </Card>
    </Box>
  );
};

CollectionInfo.displayName = "CollectionInfo";

CollectionInfo.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(CollectionInfo);