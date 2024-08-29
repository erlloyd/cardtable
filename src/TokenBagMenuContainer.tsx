import { connect } from "react-redux";
import { getCardsDataEntities } from "./features/cards-data/cards-data.selectors";
import {
  getActiveGameType,
  getGame,
  getPeerId,
  getRecentlyLoadedDecksForGameType,
} from "./features/game/game.selectors";
import { GameType } from "./game-modules/GameType";
import { RootState } from "./store/rootReducer";
import TokenBagMenu from "./TokenBagMenu";

const mapStateToProps = (state: RootState) => {
  const currentGameType = getActiveGameType(state) ?? GameType.MarvelChampions;
  return {
    currentGameType,
    // gameState: getGame(state),
    // cardsData: getCardsDataEntities(state),
    // peerId: getPeerId(state),
    // recentlyLoadedDecks:
    //   getRecentlyLoadedDecksForGameType(currentGameType)(state),
  };
};

const TokenBagMenuContainer = connect(mapStateToProps, {})(TokenBagMenu);

export default TokenBagMenuContainer;
