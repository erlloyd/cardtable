import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import {
  myPeerRef,
  possibleColors,
  useDevWSServerLocalStorage,
} from "../constants/app-constants";
import {
  getActiveGameType,
  getMultiplayerGameName,
  getPlayerColors,
  getPlayerNumbers,
} from "../features/game/game.selectors";
import {
  connectToRemoteGame,
  requestResync,
  setMultiplayerGameName,
  setAllPlayerInfo,
  createNewMultiplayerGame,
  removePlayer,
} from "../features/game/game.slice";
import {
  receiveRemoteGameState,
  verifyRemoteGameState,
} from "./global.actions";
import {
  blacklistRemoteActions,
  misingPlayerNumInSeq,
} from "./middleware-utilities";
import log from "loglevel";
import { sendNotification } from "../features/notifications/notifications.slice";
import { RootState } from "./rootReducer";
import { anyCardsDragging } from "../features/cards/cards.selectors";

export const addCurrentGameTypeMiddleware = (storeAPI: any) => {
  return (next: any) => (action: any) => {
    // get the current game state
    const activeGameType = getActiveGameType(storeAPI.getState());
    action.CURRENT_GAME_TYPE = activeGameType;
    return next(action);
  };
};
