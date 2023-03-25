import { connect } from "react-redux";

import { RootState } from "../store/rootReducer";
import Notifications from "./Notifications";
import {
  activeNotification,
  hasNotification,
} from "../features/notifications/notifications.selectors";
import { clearNotification } from "../features/notifications/notifications.slice";

export interface IProps {
  id: string;
}

const mapStateToProps = (state: RootState) => {
  return {
    hasNotification: hasNotification(state),
    activeNotification: activeNotification(state),
  };
};

const NotificationsContainer = connect(mapStateToProps, {
  clearNotification,
})(Notifications);

export default NotificationsContainer;
