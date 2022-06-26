import cloneDeep from "lodash.clonedeep";
import { myPeerRef, possibleColors } from "../constants/app-constants";
import {
  getMultiplayerGameName,
  getPlayerColors,
  getPlayerNumbers,
} from "../features/game/game.selectors";
import {
  connectToRemoteGame,
  requestResync,
  setMultiplayerGameName,
  setAllPlayerInfo,
} from "../features/game/game.slice";
import {
  receiveRemoteGameState,
  verifyRemoteGameState,
} from "./global.actions";
import {
  blacklistRemoteActions,
  misingPlayerNumInSeq,
} from "./middleware-utilities";

const useDevWSServer = localStorage.getItem("__dev_ws__");
interface IMessage {
  type: string;
  payload: any;
}

const updateUrl = (gameName: string) => {
  const url = new URL(window.location as any);
  url.searchParams.set("remote", encodeURIComponent(gameName));
  window.history.pushState({}, "", url);
};

export const websocketMiddleware = (storeAPI: any) => {
  const ws = new WebSocket(
    `wss://${
      !!useDevWSServer ? "local-" : ""
    }cardtable-server.middle-earth.house`
  );

  const handleRemoteAction = (action: any) => {
    if (!action.INITIAL_STATE_MSG) {
      if (!!action.RESYNC) {
        ws.send(
          JSON.stringify({
            type: "remoteaction",
            game: getMultiplayerGameName(storeAPI.getState()),
            payload: {
              INITIAL_STATE_MSG: true,
              state: storeAPI.getState(),
            },
          })
        );
      } else if (!!action.PING) {
        // Check local state
        action.REMOTE_ACTION = true;
        storeAPI.dispatch(verifyRemoteGameState(action.state));
      } else {
        action.REMOTE_ACTION = true;
        storeAPI.dispatch(action);
      }
    } else {
      console.log("going to replace (most of) state with", action.state);
      setTimeout(() => {
        storeAPI.dispatch(receiveRemoteGameState(action.state));
      }, 0);
    }
  };

  ws.addEventListener("open", () => {
    console.log("We are connected to the WS");

    //Check for a query param
    const url = new URL(window.location as any);
    const remoteQueryParam = url.searchParams.get("remote");
    if (!!remoteQueryParam) {
      // connect to the remote game
      console.log(`going to connect to ${remoteQueryParam}`);
      ws.send(
        JSON.stringify({
          type: "connecttogame",
          payload: { game: remoteQueryParam, playerRef: myPeerRef },
        })
      );
    } else {
      // create a new game
      ws.send(
        JSON.stringify({
          type: "newgame",
        })
      );
    }
  });

  ws.addEventListener("message", (msg) => {
    try {
      const data: IMessage = JSON.parse(msg.data);

      switch (data.type) {
        case "newgamecreated":
          storeAPI.dispatch(setMultiplayerGameName(data.payload as string));
          updateUrl(data.payload);
          break;
        case "connectedtogame":
          storeAPI.dispatch(setMultiplayerGameName(data.payload as string));
          storeAPI.dispatch(requestResync());
          updateUrl(data.payload);
          break;
        case "newplayerconnected":
          const currentPlayerColors = getPlayerColors(storeAPI.getState());
          const currentPlayerNumbers = getPlayerNumbers(storeAPI.getState());

          let newPlayerNumbers = cloneDeep(currentPlayerNumbers);

          // First, figure out the first available player number
          if (
            !Object.keys(currentPlayerNumbers).includes(data.payload.playerRef)
          ) {
            const nextPlayerNum = misingPlayerNumInSeq(
              Object.values(currentPlayerNumbers)
            );
            newPlayerNumbers[data.payload.playerRef] = nextPlayerNum;
            console.log(
              "new player added, going to be player number " + nextPlayerNum
            );
          }

          let newPlayerColors = cloneDeep(currentPlayerColors);
          if (
            !Object.keys(currentPlayerColors).includes(data.payload.playerRef)
          ) {
            const num = newPlayerNumbers[data.payload.playerRef];
            const playerColorByNum =
              possibleColors[(num - 1) % possibleColors.length];
            newPlayerColors[data.payload.playerRef] = playerColorByNum;
            console.log(
              "new player added, going to be player color " + playerColorByNum
            );
          }

          storeAPI.dispatch(
            setAllPlayerInfo({
              colors: newPlayerColors,
              numbers: newPlayerNumbers,
            })
          );
          break;
        case "remoteaction":
          handleRemoteAction(data.payload);
          break;
      }
    } catch (e) {
      console.error(`Problem handling message:`, e);
    }
  });

  return (next: any) => (action: any) => {
    if (!action.REMOTE_ACTION) {
      action.ACTOR_REF = myPeerRef;
    } else if (!action.ACTOR_REF) {
      console.error(`Received a REMOTE action without an ACTOR_REF:`);
      console.log(action);
    }

    if (action.type === setAllPlayerInfo.type) {
      if (action.ACTOR_REF === myPeerRef) {
        console.log("RECEIVED SET ALL PLAYER INFO FROM LOCAL");
      } else {
        console.log("RECEIVED SET ALL PLAYER INFO FROM REMOTE");
      }
    }

    if (action.type === connectToRemoteGame.type) {
      console.log("going to connect to game " + action.payload);
      ws.send(
        JSON.stringify({
          type: "connecttogame",
          payload: { game: action.payload, playerRef: myPeerRef },
        })
      );
      // setupConnection(activeCon, storeAPI);
    } else if (action.type === requestResync.type) {
      if (ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "resync",
            game: getMultiplayerGameName(storeAPI.getState()),
            payload: { RESYNC: true },
          })
        );
      }
    }

    if (
      !action.REMOTE_ACTION &&
      !!ws.OPEN &&
      !blacklistRemoteActions[action.type]
    ) {
      // console.log("going to send action to websocket!");
      const message = {
        type: "remoteaction",
        game: getMultiplayerGameName(storeAPI.getState()),
        payload: action,
      };
      ws.send(JSON.stringify(message));
    }

    return next(action);
  };
};