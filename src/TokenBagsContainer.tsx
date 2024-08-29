import { connect } from "react-redux";
import TokenBags from "./TokenBags";
import { getTokenBags } from "./features/token-bags/token-bags.selectors";
import { RootState } from "./store/rootReducer";
import { setTokenBagPosition } from "./features/token-bags/token-bags.slice";
import { setTokenBagMenuPosition } from "./features/game/game.slice";

const mapStateToProps = (state: RootState) => {
  return {
    bags: getTokenBags(state),
  };
};

const TokenBagsContainer = connect(mapStateToProps, {
  setTokenBagPosition,
  setTokenBagMenuPosition,
})(TokenBags);

export default TokenBagsContainer;
