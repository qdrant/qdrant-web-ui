import React, { ComponentProps, Fragment, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { SuccessNotifierProps, TransitionProps } from "./types";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
Alert.displayName = "Alert";

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="down" />;
}

export function SuccessNotifier({
  message,
  setIsSuccess,
}: SuccessNotifierProps) {
  const [open, setOpen] = useState(true);

  const handleClose = (
    _event: React.SyntheticEvent<Element, Event> | Event,
    reason: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setIsSuccess(false);
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose as any}
        severity="success"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
