import { createSelector } from "reselect";
import { RootState } from "../../store/rootReducer";

export const getNotifications = (state: RootState) => state.notifications;

export const hasNotification = createSelector(
  getNotifications,
  (notificationsState) => notificationsState.notificationsQueue.length > 0
);

export const activeNotification = createSelector(
  getNotifications,
  (notificationsState) => notificationsState.notificationsQueue[0] ?? null
);

export const notificationList = createSelector(
  getNotifications,
  (notificationsState) => notificationsState.notificationsQueue
);
