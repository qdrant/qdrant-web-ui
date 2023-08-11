import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from '@mui/material/styles';
import { Box } from "@mui/material";
import { useClient } from "../../context/client-context";

export const CollectionInfo = ({ collectionName }) => {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [collection, setCollection] = React.useState({});

  useEffect(() => {
    // loading state (global context?)
   qdrantClient.getCollection(collectionName)
     .then((res) => {
        console.log(res);
        setCollection(res);
      }).catch((err) => {
        console.log(err);
        // snackbar error
      });
  }, [collectionName]);

  return (
    <Box pt={2}>
      <JsonViewer
        theme={theme.palette.mode}
        value={collection}
        displayDataTypes={false}
        defaultInspectDepth={0}
        rootName={false}
        editable={true}
        onChange={(path, oldValue, newValue) => {
          console.log({path, oldValue, newValue});
        }
        }
      />
    </Box>
  );
};

CollectionInfo.propTypes = {
  collectionName: PropTypes.string,
};