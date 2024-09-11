import { connect } from "react-redux";
import {
  getActiveGameType,
  getGame,
  getTokenBagMenu,
} from "./features/game/game.selectors";
import { RootState } from "./store/rootReducer";
import TokenEditor from "./TokenEditor";
import { hideTokenBagEditor } from "./features/game/game.slice";
import { GameType } from "./game-modules/GameType";
import { getTokenBagById } from "./features/token-bags/token-bags.selectors";
import {
  addTokenToBagWithCode,
  removeTokenFromBagWithCode,
} from "./features/token-bags/token-bags.slice";

const mapStateToProps = (state: RootState) => {
  const metadata = getGame(state).showTokenBagAdjuster;
  const bagId = metadata?.id;
  const viewOnly = !!metadata?.viewOnly;

  return {
    currentGameType: getActiveGameType(state) ?? GameType.MarvelChampions,
    visible: !!metadata,
    bag: getTokenBagById(bagId ?? "")(state),
    viewOnly,
  };
};

const TokenEditorContainer = connect(mapStateToProps, {
  hideTokenBagEditor,
  addTokenToBagWithCode,
  removeTokenFromBagWithCode,
})(TokenEditor);

export default TokenEditorContainer;
