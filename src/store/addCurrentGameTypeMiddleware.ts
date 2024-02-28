import { getActiveGameType } from "../features/game/game.selectors";

export const addCurrentGameTypeMiddleware = (storeAPI: any) => {
  return (next: any) => (action: any) => {
    // get the current game state
    const activeGameType = getActiveGameType(storeAPI.getState());
    action.CURRENT_GAME_TYPE = activeGameType;
    return next(action);
  };
};
