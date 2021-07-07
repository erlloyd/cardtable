import { connect } from "react-redux";

import { RootState } from "./store/rootReducer";
import { getCardMapById } from "./features/cards/cards.selectors";
import CardModifiers from "./CardModifiers";

export interface IProps {
  id: string;
}

const mapStateToProps = (state: RootState, props: IProps) => {
  return {
    card: getCardMapById(state)[props.id],
  };
};

const CardModifiersContainer = connect(mapStateToProps, {})(CardModifiers);

export default CardModifiersContainer;
