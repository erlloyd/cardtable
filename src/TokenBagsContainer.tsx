import { connect } from "react-redux";
import TokenBags from "./TokenBags";
import { getTokenBags } from "./features/token-bags/token-bags.selectors";
import { RootState } from "./store/rootReducer";

const mapStateToProps = (state: RootState) => {
  return {
    bags: getTokenBags(state),
  };
};

const TokenBagsContainer = connect(mapStateToProps, {})(TokenBags);

export default TokenBagsContainer;
