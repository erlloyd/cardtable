import { connect } from "react-redux";
import TouchMenu from "./TouchMenu";
import { getPanMode } from "./features/cards/cards.selectors";
import {
  exhaustCard,
  flipCards,
  togglePanMode,
} from "./features/cards/cards.slice";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    panMode: getPanMode(state),
  };
};

const TouchMenuContainer = connect(mapStateToProps, {
  togglePanMode,
  flipCards,
  exhaustCard,
})(TouchMenu);

export default TouchMenuContainer;
