import { connect } from "react-redux";
import FirstPlayerToken from "./FirstPlayerToken";
import { moveFirstPlayerCounter } from "./features/counters/counters.slice";
import { RootState } from "./store/rootReducer";
import { getFirstPlayerTokenPos } from "./features/counters/counters.selectors";

const mapStateToProps = (state: RootState) => {
  return {
    pos: getFirstPlayerTokenPos(state),
  };
};

const FirstPlayerTokenContainer = connect(mapStateToProps, {
  updatePos: moveFirstPlayerCounter,
})(FirstPlayerToken);

export default FirstPlayerTokenContainer;
