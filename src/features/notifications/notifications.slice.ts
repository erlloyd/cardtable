import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  INotification,
  INotificationsState,
  initialState,
} from "./initialState";

// Reducers
const sendNotificationReducer: CaseReducer<
  INotificationsState,
  PayloadAction<INotification>
> = (state, action) => {
  state.notificationsQueue.push(action.payload);
};

const sendAndForceNotificationReducer: CaseReducer<
  INotificationsState,
  PayloadAction<INotification>
> = (state, action) => {
  state.notificationsQueue[0] = action.payload;
};

const clearNotificationReducer: CaseReducer<
  INotificationsState,
  PayloadAction<string>
> = (state, action) => {
  state.notificationsQueue = state.notificationsQueue.filter(
    (n) => n.id !== action.payload
  );
};

// slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: initialState,
  reducers: {
    sendNotification: sendNotificationReducer,
    sendAndForceNotification: sendAndForceNotificationReducer,
    clearNotification: clearNotificationReducer,
  },
});

export const { sendNotification, sendAndForceNotification, clearNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
