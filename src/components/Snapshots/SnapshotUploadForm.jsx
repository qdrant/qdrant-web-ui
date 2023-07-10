import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import { Button, Card, CardActions, CardContent } from "@mui/material";
import { Dropzone } from "../Forms/Dropzone";
import { useClient } from "../../context/client-context";

export const SnapshotUploadForm = ({ onSubmit, sx }) => {
  const { client: qdrantClient } = useClient();
  const [collectionName, setCollectionName] = useState("");
  const [files, setFiles] = useState([]);
  const [formError, setFormError] = useState(false);

  const handleDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const handleSubmit = () => {
    console.log(files);
    console.log(qdrantClient);
    console.log(qdrantClient._restUri);
    const formData = new FormData();
    formData.append("file", files[0]);
    const url = new URL(`/collections/${collectionName}/snapshots/upload`,
      qdrantClient._restUri);
    const headers = new Headers();
    headers.append("Content-Type", "multipart/form-data");
    fetch(url, {
      method: "POST",
      headers,
      body: formData,
    }).then((response) => {
      console.log("response:");
      console.log(response);
    }).catch(error => console.error(error));
    if (onSubmit) onSubmit();
  };

  return (
    <Card sx={{ ...sx }}>
      <CardContent>

        <TextField
          error={formError}
          id="collection-name"
          label="Collection Name"
          value={collectionName}
          helperText={formError ? "Invalide value" : " "}
          onChange={(event) => {
            // todo: move
            setCollectionName(event.target.value);
            collectionName.length < 4 ?
              setFormError(true) :
              setFormError(false);
          }}
        />
        <Dropzone
          onDrop={handleDrop}
          options={{
            accept: {
              "application/x-tar": [".snapshot"],
            },
            maxFiles: 1,
          }}
        />
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={handleSubmit}>
          Upload Snapshot
        </Button>
      </CardActions>
    </Card>
  );
};

// props validation
SnapshotUploadForm.propTypes = {
  onSubmit: PropTypes.func,
  sx: PropTypes.object,
};