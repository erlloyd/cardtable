import { connect } from "react-redux";

import { RootState } from "./store/rootReducer";
import CardTokens from "./CardTokens";
import { getCardMapById } from "./features/cards/cards.selectors";

export interface IProps {
  id: string;
}

const mapStateToProps = (state: RootState, props: IProps) => {
  return {
    card: getCardMapById(state)[props.id],
  };
};

const CardTokensContainer = connect(mapStateToProps, {})(CardTokens);

export default CardTokensContainer;
