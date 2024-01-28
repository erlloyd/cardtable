import { connect } from "react-redux";

import { RootState } from "./store/rootReducer";
import CardTokens from "./CardTokens";
import { getCardMapById } from "./features/cards/cards.selectors";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";

export interface IProps {
  id: string;
}

const mapStateToProps = (state: RootState, props: IProps) => {
  const card = getCardMapById(state)[props.id];
  return {
    card,
    cardData: getCardsDataEntities(state),
  };
};

const CardTokensContainer = connect(mapStateToProps, {})(CardTokens);

export default CardTokensContainer;
