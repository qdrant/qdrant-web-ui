/* eslint-disable */
import React, { memo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  alpha,
  Box,
  Card,
  CardContent, CardHeader, Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useClient } from "../../context/client-context";
import { DataGridList } from "../Points/DataGridList";
import { CopyButton } from "../Common/CopyButton";
import { Dot } from "../Common/Dot";

export const CollectionInfo = ({ collectionName }) => {
  const theme = useTheme();
  console.log("render CollectionInfo");
  const { client: qdrantClient } = useClient();
  const [collection, setCollection] = React.useState({});
  const [clusterInfo, setClusterInfo] = React.useState({});

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

    // todo: show in UI
    qdrantClient.api("cluster").
      collectionClusterInfo({ collection_name: collectionName }).
      then((res) => {
        console.log(res);
        setClusterInfo(() => {
          return { ...res };
        });
      }).
      catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Box pt={2}>
      <Card variant="dual">
        <CardHeader
          title={"Collection Info"}
          sx={{
            flexGrow: 1,
            background: alpha(theme.palette.primary.main, 0.05),
          }}
          action={
            <CopyButton text={JSON.stringify(collection)}/>
          }
        />
        <CardContent>
          <DataGridList
            data={collection}
            specialCases={{
              "status":
                <Typography variant="subtitle1" color="text.secondary">
                  {collection.status} <Dot color={collection.status}/>
                </Typography>,
            }}
          />
        </CardContent>
      </Card>

      <Card variant="dual" sx={{ mt: 5 }}>
        <CardHeader
          title={"Collection Cluster Info"}
          sx={{
            flexGrow: 1,
            background: alpha(theme.palette.primary.main, 0.05),
          }}
          action={
            <CopyButton text={JSON.stringify(collection)}/>
          }
        />
        <CardContent>
          <DataGridList
            data={clusterInfo}
          />
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