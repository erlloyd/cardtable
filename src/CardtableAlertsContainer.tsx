import { connect } from "react-redux";
import CardtableAlerts from "./CardtableAlerts";
import { getCards } from "./features/cards/cards.selectors";
import { requestResync } from "./features/game/game.slice";
import { COUNT_OUT_OF_SYNC_THRESHOLD } from "./features/cards/cards.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    open:
      getCards(state).outOfSyncWithRemoteCount >= COUNT_OUT_OF_SYNC_THRESHOLD,
  };
};

const CardtableAlertsContainer = connect(mapStateToProps, {
  requestResync,
})(CardtableAlerts);

export default CardtableAlertsContainer;
