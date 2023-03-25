import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import {
  myPeerRef,
  possibleColors,
  useDevWSServer,
} from "../constants/app-constants";
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
  createNewMultiplayerGame,
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
      log.debug("going to replace (most of) state with", action.state);
      setTimeout(() => {
        storeAPI.dispatch(receiveRemoteGameState(action.state));
      }, 0);
    }
  };

  ws.addEventListener("open", () => {
    log.debug("We are connected to the WS");

    //Check for a query param
    const url = new URL(window.location as any);
    const remoteQueryParam = url.searchParams.get("remote");
    if (!!remoteQueryParam) {
      // connect to the remote game
      log.debug(`going to connect to ${remoteQueryParam}`);
      ws.send(
        JSON.stringify({
          type: "connecttogame",
          payload: { game: remoteQueryParam, playerRef: myPeerRef },
        })
      );
    } else {
      // create a new game
      // NOTE: Commented out to try to be specific about when we create a new game
      // ws.send(
      //   JSON.stringify({
      //     type: "newgame",
      //   })
      // );
    }
  });

  ws.addEventListener("message", (msg) => {
    try {
      const data: IMessage = JSON.parse(msg.data);

      switch (data.type) {
        case "newgamecreated":
          storeAPI.dispatch(setMultiplayerGameName(data.payload as string));
          storeAPI.dispatch(
            sendNotification({
              id: uuidv4(),
              level: "success",
              message: `Successfully created game ${data.payload as string}`,
            })
          );
          updateUrl(data.payload);
          break;
        case "connectedtogame":
          storeAPI.dispatch(setMultiplayerGameName(data.payload as string));
          storeAPI.dispatch(requestResync());
          storeAPI.dispatch(
            sendNotification({
              id: uuidv4(),
              level: "success",
              message: `Successfully connected to game ${
                data.payload as string
              }`,
            })
          );
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
            log.debug(
              "new player added, going to be player number " + nextPlayerNum
            );
            storeAPI.dispatch(
              sendNotification({
                id: uuidv4(),
                level: "success",
                message: `Player number ${nextPlayerNum} joined the game!`,
              })
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
            log.debug(
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
      log.error(`Problem handling message:`, e);
    }
  });

  return (next: any) => (action: any) => {
    const mpGameName = getMultiplayerGameName(storeAPI.getState());

    if (!action.REMOTE_ACTION) {
      action.ACTOR_REF = myPeerRef;
    } else if (!action.ACTOR_REF) {
      log.error(`Received a REMOTE action without an ACTOR_REF:`);
      log.error(action);
    }

    if (action.type === setAllPlayerInfo.type) {
      if (action.ACTOR_REF === myPeerRef) {
        log.debug("RECEIVED SET ALL PLAYER INFO FROM LOCAL");
      } else {
        log.debug("RECEIVED SET ALL PLAYER INFO FROM REMOTE");
      }
    }

    if (action.type === createNewMultiplayerGame.type) {
      log.debug("going to create new game");
      ws.send(
        JSON.stringify({
          type: "newgame",
        })
      );
    } else if (action.type === connectToRemoteGame.type) {
      log.debug("going to connect to game " + action.payload);
      ws.send(
        JSON.stringify({
          type: "connecttogame",
          payload: { game: action.payload, playerRef: myPeerRef },
        })
      );
      // setupConnection(activeCon, storeAPI);
    } else if (action.type === requestResync.type) {
      if (!!ws.OPEN && !!mpGameName) {
        ws.send(
          JSON.stringify({
            type: "resync",
            game: mpGameName,
            payload: { RESYNC: true },
          })
        );
      }
    }

    if (
      !action.REMOTE_ACTION &&
      !!ws.OPEN &&
      !blacklistRemoteActions[action.type] &&
      !!mpGameName
    ) {
      log.trace(`Sending ${action.type} over the websocket`);
      const message = {
        type: "remoteaction",
        game: mpGameName,
        payload: action,
      };
      ws.send(JSON.stringify(message));
    }

    return next(action);
  };
};
