import React, { memo, useState } from "react";
import DialogActions from "@mui/material/DialogActions";
import { Button, Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import EditorCommon from "../EditorCommon";
import qdrantClient from "../../common/client";
import { errChecker } from "../CodeEditorWindow/config/ErrorMarker";

export const PayloadEditor = memo(({ payloadJson, open, onClose }) => {
  const [payload, setPayload] = useState(payloadJson);
  const [loading, setLoading] = useState(false);

  const handleChange = (value) => {
    errChecker(value);
    setPayload(value);
  };

  const handleSave = () => {
    if (payloadJson !== payload) {
      setLoading(true);

      qdrantClient().updatePayload(payload).then((res) => {
        console.log(res);
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
          parentHeight={true}
          language="json"
          value={JSON.stringify(payload, null, 2)}
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
});