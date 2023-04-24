import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { ErrorNotifierProps, TransitionProps } from "./types";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

Alert.displayName = "Alert";

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="down" />;
}

export function ErrorNotifier({ message, setHasError }: ErrorNotifierProps) {
  const [open, setOpen] = useState(true);

  const handleClose = (
    _event: React.SyntheticEvent<Element, Event> | Event,
    reason: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setHasError(false);
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      disableWindowBlurListener
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose as any}
        severity="error"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
