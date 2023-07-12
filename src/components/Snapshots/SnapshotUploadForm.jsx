import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import {
  StepContent,
  Stepper,
  Typography,
  Box,
  StepLabel,
  Step,
  Paper,
  Button,
} from "@mui/material";
import { useClient } from "../../context/client-context";
import { Uppy } from "@uppy/core";
import DragDrop from "@uppy/react/lib/DragDrop";
import StatusBar from "@uppy/react/lib/StatusBar";
import XHR from "@uppy/xhr-upload";
import { withStyles } from "@mui/styles";

import "@uppy/core/dist/style.min.css";
import "@uppy/drag-drop/dist/style.min.css";
import "@uppy/status-bar/dist/style.min.css";

const styles = theme => ({
  root: {
    "& .uppy-DragDrop-container": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  },
});

const StyledDragDrop = withStyles(styles)(
  (props) => <div className={props.classes.root}><DragDrop {...props} /></div>);

// todo:
//  - [x] abort upload on closing the dialog (external method?)
//  - [x] button?
//  - [x] themed DragDrop
//  - [ ] what can be collectionName length, can it contain not [A-Za-z]?
//  - [ ] what is the max file size?
//  - [ ] clean up the code
export const SnapshotUploadForm = ({ onSubmit, sx, ...props }) => {
  const { client: qdrantClient } = useClient();
  const [activeStep, setActiveStep] = React.useState(0);
  const [collectionName, setCollectionName] = useState("");
  const [formError, setFormError] = useState(false);
  const COLLECTION_NAME_LENGTH = 4;

  /**
   * Get the endpoint URL for uploading a snapshot, based on the collection name.
   * qdrantClient._restUri is the base URL for the API
   * @type {function(): string}
   */
  const getEndpointUrl = useCallback(() => {
    return new URL(`/collections/${collectionName}/snapshots/upload`,
      qdrantClient._restUri).href;
  }, [collectionName, qdrantClient]);

  /* initialize uploader, docs: https://uppy.io/ */
  const uppy = new Uppy({
    restrictions: {
      // maxFileSize: 1000000, // todo: what is the max file size?
      maxNumberOfFiles: 1,
      minNumberOfFiles: 1,
      allowedFileTypes: ["application/x-tar", ".snapshot"],
    },
    autoProceed: true,
    debug: true, // todo
  });

  uppy.use(XHR, {
    endpoint: getEndpointUrl(),
    formData: true,
    fieldName: "snapshot",
  });

  uppy.on("complete", (result) => {
    handleFinish();
    onSubmit();
  });

  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  const handleTextChange = (event) => {
    const newCollectionName = event.target.value;
    setCollectionName(newCollectionName);
    setFormError(newCollectionName.length < COLLECTION_NAME_LENGTH);
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    uppy.cancelAll();
  };

  const handleFinish = () => {
    setActiveStep(3);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {/*Step 1 start - enter a collection name*/}
        <Step key={"Step 1 - enter a collection name"}>
          <StepLabel>
            Step 1 - Enter a collection name
          </StepLabel>
          <StepContent>
            <Typography mb={2}>Can be new or existing</Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                error={formError}
                id="collection-name"
                label="Collection Name"
                value={collectionName}
                helperText={formError ? "Collection name is required" : " "}
                onChange={handleTextChange}
                fullWidth={true}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
                disabled={!collectionName || formError}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>
        {/*Step 1 end - enter a collection name*/}

        {/*Step 2 start - upload a snapshot file*/}
        <Step key={"Step 2 - upload a snapshot file"}>
          <StepLabel>
            Step 2 - Upload a snapshot file
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              {/*Here we have a drag and drop area*/}
              <StyledDragDrop uppy={uppy}/>
              <StatusBar uppy={uppy}/>
            </Box>
            <Box mb={2}>
              <Button
                variant="contained"
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
              >
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>
        {/*Step 2 end - upload a snapshot file*/}
      </Stepper>
      {activeStep === 3 && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished 🎉</Typography>
        </Paper>
      )}
    </Box>
  );
};

// props validation
SnapshotUploadForm.propTypes = {
  onSubmit: PropTypes.func,
  sx: PropTypes.object,
};