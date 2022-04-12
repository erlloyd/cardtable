import { connect } from "react-redux";
import CardtableAlerts from "./CardtableAlerts";
import { getCards } from "./features/cards/cards.selectors";
import { requestResync } from "./features/game/game.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    open: getCards(state).outOfSyncWithRemote,
  };
};

const CardtableAlertsContainer = connect(mapStateToProps, {
  requestResync,
})(CardtableAlerts);

export default CardtableAlertsContainer;
