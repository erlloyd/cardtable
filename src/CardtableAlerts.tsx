import React from "react";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Button, Snackbar } from "@mui/material";

interface IProps {
  open: boolean;
  requestResync: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CardtableAlerts = (props: IProps) => {
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
  };

  const handleResync = () => {
    props.requestResync();
  };

  return (
    <Snackbar
      open={props.open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="warning"
        onClose={handleClose}
        sx={{ width: "100%" }}
        action={
          <React.Fragment>
            <Button color="inherit" size="small" onClick={handleResync}>
              RE-SYNC
            </Button>
          </React.Fragment>
        }
      >
        Out of sync with other player
      </Alert>
    </Snackbar>
  );
};

export default CardtableAlerts;
