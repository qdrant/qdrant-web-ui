import React, { memo, useState } from "react";
import DialogActions from "@mui/material/DialogActions";
import { Button, Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import EditorCommon from "../EditorCommon";
import { useClient } from "../../context/client-context";
import { errChecker } from "../CodeEditorWindow/config/ErrorMarker";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import isEqual from "lodash/isEqual";

export const PayloadEditor = memo(
  ({ collectionName, point, open, onClose, onSave, setLoading }) => {
    const { client: qdrantClient } = useClient();
    const { enqueueSnackbar } = useSnackbar();
    const [payload, setPayload] = useState(point.payload);

    // todo:
    // - [ ] add error checking for payload ?
    // - [x] add error handling for savePayload
    // - [x] style buttons
    // - [x] add loading indicator
    // - [x] add lodash

    const savePayload = async (collectionName, options) => {
      if (Object.keys(point.payload).length !== 0) {
        return qdrantClient.overwritePayload(collectionName, options);
      } else {
        return qdrantClient.setPayload(collectionName, options);
      }
    };
    const handleChange = (value) => {
      setPayload(JSON.parse(value));
    };

    const handleSave = () => {
      // do nothing if payload is not changed
      if (isEqual(point.payload, payload)) {
        onClose();
        return;
      }

      setLoading(true);
      const oldPayload = structuredClone(point.payload);
      // errChecker(payload);

      savePayload(
        collectionName,
        {
          payload: payload,
          points: [point.id],
          wait: true,
        },
      ).then((res) => {
        console.log(res);
        if (onSave && res.status === "completed") {
          onSave(payload);
        }
      }).catch((err) => {
        onSave && onSave(oldPayload);
        enqueueSnackbar(err.message, {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        });
      }).finally(() => {
        setLoading(false);
        enqueueSnackbar("Payload saved", {
          variant: "success",
          autoHideDuration: 1500,
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        });
      });
      onClose();
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Edit payload for point {point.id}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <EditorCommon
            height="50vh"
            language="json"
            value={JSON.stringify(point.payload, null, 2)}
            onChange={handleChange}
            options={{
              scrollBeyondLastLine: false,
              fontSize: 12,
              wordWrap: "on",
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={onClose} color="error" variant="outlined"
                  sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={handleSave} color="success"
                  variant="outlined">Save</Button>
        </DialogActions>
      </Dialog>
    );
  },
);

PayloadEditor.propTypes = {
  collectionName: PropTypes.string.isRequired,
  point: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};