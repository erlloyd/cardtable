import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { INotification } from "../features/notifications/initialState";
import isEqual from "lodash.isequal";
import cloneDeep from "lodash.clonedeep";

interface IProps {
  hasNotification: boolean;
  activeNotification: INotification | null;
  clearNotification: (id: string) => void;
}

const Notifications = ({
  activeNotification,
  hasNotification,
  clearNotification,
}: IProps) => {
  useEffect(() => {
    setTimeout(() => {
      clearNotification(activeNotification?.id ?? "");
    }, 4000);
  }, [activeNotification, clearNotification]);

  // We need to save the last notification, otherwise
  // if the notification goes to null at the same time
  // the `hasNotification` goes to false, you still see
  // a weird flash
  const [lastNotification, setLastNotification] =
    useState<INotification | null>(null);

  if (
    activeNotification !== null &&
    !isEqual(lastNotification, activeNotification)
  ) {
    setLastNotification(cloneDeep(activeNotification));
  }

  const handleClose =
    (id: string) => (_event: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      clearNotification(id);
    };

  return (
    <Snackbar
      open={hasNotification}
      onClose={handleClose(lastNotification?.id ?? "")}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ bottom: { xs: 90, sm: 90, m: 90, l: 90, xl: 90 } }}
    >
      <Alert
        onClose={handleClose(lastNotification?.id ?? "")}
        severity={lastNotification?.level ?? "success"}
        sx={{ width: "100%" }}
      >
        {lastNotification?.message ?? ""}
      </Alert>
    </Snackbar>
  );
};

export default Notifications;
