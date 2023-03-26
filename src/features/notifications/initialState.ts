export type INotificationType = "error" | "warning" | "info" | "success";

export interface INotification {
  id: string;
  message: string;
  level: INotificationType;
}

export interface INotificationsState {
  notificationsQueue: INotification[];
}

const defaultState: INotificationsState = {
  notificationsQueue: [],
};
export const initialState: INotificationsState = {
  ...defaultState,
  // As of now we have nothing we want to store in localStorage... but
  // leaving this here for reference
  // ...localStorageState,
};
