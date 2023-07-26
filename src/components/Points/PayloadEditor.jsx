import React, { memo, useState } from "react";
import DialogActions from "@mui/material/DialogActions";
import { Button, Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import EditorCommon from "../EditorCommon";
import { useClient } from "../../context/client-context";

export const PayloadEditor = memo(
  ({ collectionName, point, open, onClose }) => {
    console.log("PayloadEditor");
    const { client: qdrantClient } = useClient();
    const [payload, setPayload] = useState(point.payload);
    const [loading, setLoading] = useState(false);

    const handleChange = (value) => {
      console.log(value);
      setPayload(value);
    };

    const handleSave = () => {
      console.log(payload);
      if (point.payload !== payload) {
        console.log("update payload");
        // errChecker(payload);
        setLoading(true);


        qdrantClient.overwritePayload(
          collectionName,
          {
            payload: JSON.parse(payload),
            points: [point.id],
            wait: true,
          },
        ).then((res) => {
          console.log("res", res);
        }).catch((err) => {
          console.log(err);
        }).finally(() => {
          setLoading(false);
        });
      }
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
          Edit payload
        </DialogTitle>
        <DialogContent>
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
            beforeMount={() => {
              console.log("beforeMount");
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  })
;