import { myPeerRef } from "../constants/app-constants";
import { getMultiplayerGameName } from "../features/game/game.selectors";
import {
  connectToRemoteGame,
  requestResync,
  setMultiplayerGameName,
  setPlayerInfo,
} from "../features/game/game.slice";
import {
  receiveRemoteGameState,
  verifyRemoteGameState,
} from "./global.actions";
import { blacklistRemoteActions } from "./middleware-utilities";

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
  const ws = new WebSocket("wss://local-cardtable-server.middle-earth.house");

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
          const setPlayerInfoAction = setPlayerInfo({
            ref: data.payload.playerRef,
            color: "blue",
            playerNumber: 2,
          });

          ws.send(
            JSON.stringify({
              type: "remoteaction",
              payload: setPlayerInfoAction,
            })
          );
          ws.send(
            JSON.stringify({
              type: "remoteaction",
              payload: setPlayerInfo({
                ref: myPeerRef,
                color: "red",
                playerNumber: 1,
              }),
            })
          );
          storeAPI.dispatch(setPlayerInfoAction);
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
