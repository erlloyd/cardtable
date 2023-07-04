import cloneDeep from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";
import {
  myPeerRef,
  possibleColors,
  useDevWSServerLocalStorage,
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
interface IMessage {
  type: string;
  payload: any;
}

const updateUrl = (gameName: string) => {
  const url = new URL(window.location as any);
  url.searchParams.set("remote", encodeURIComponent(gameName));
  window.history.pushState({}, "", url);
};

const STATE_CHECK_INTERVAL_MS = 5000;
const RECONNECT_LIMIT = 10;
const RECONNECT_RETRY_MS = 3000;
let currentReconnectCount = 0;
let stateCheckTimer: NodeJS.Timer | undefined;

export const websocketMiddleware = (storeAPI: any) => {
  const handleRemoteAction = (action: any) => {
    // console.log("remote action", action);
    if (!action.INITIAL_STATE_MSG) {
      if (!!action.RESYNC) {
        ws?.send(
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

  let ws: WebSocket | null = new WebSocket(
    `wss://${
      !!useDevWSServerLocalStorage ? "local-" : ""
    }cardtable-server.middle-earth.house${
      !useDevWSServerLocalStorage ? ":3333" : ""
    }`
  );

  const setup = () => {
    if (ws === null) {
      ws = new WebSocket(
        `wss://${
          !!useDevWSServerLocalStorage ? "local-" : ""
        }cardtable-server.middle-earth.house${
          !useDevWSServerLocalStorage ? ":3333" : ""
        }`
      );
    }
    ws.addEventListener("open", () => {
      log.debug("We are connected to the WS");
      if (currentReconnectCount !== 0) {
        storeAPI.dispatch(
          sendNotification({
            id: uuidv4(),
            level: "success",
            message: `Successfully reconnected to the muliplayer server.`,
          })
        );
      }
      currentReconnectCount = 0;
      //Check for a query param
      const url = new URL(window.location as any);
      const remoteQueryParam = url.searchParams.get("remote");
      if (!!remoteQueryParam) {
        // connect to the remote game
        log.debug(`going to connect to ${remoteQueryParam}`);
        ws?.send(
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

      if (!!stateCheckTimer) {
        clearInterval(stateCheckTimer);
      }

      stateCheckTimer = setInterval(() => {
        const currentState: RootState = cloneDeep(storeAPI.getState());

        const mpGameName = getMultiplayerGameName(storeAPI.getState());
        const nothingDragging = anyCardsDragging(currentState); // THIS IS NAMED POORLY
        // only check state if no cards are moving
        if (nothingDragging && !!mpGameName) {
          // @ts-ignore
          delete currentState.cardsData;

          ws?.send(
            JSON.stringify({
              PING: true,
              state: currentState,
              game: mpGameName,
            })
          );
        }
        // else {
        //   log.debug(
        //     `Some card is dragging or no multiplayer game, not checking remote state sync`
        //   );
        // }
      }, STATE_CHECK_INTERVAL_MS);
    });

    ws.addEventListener("close", () => {
      log.warn("WS connection closed");
      if (!!stateCheckTimer) {
        clearInterval(stateCheckTimer);
        stateCheckTimer = undefined;
      }
      // try to reconnect the websocket
      if (currentReconnectCount < RECONNECT_LIMIT) {
        if (currentReconnectCount % 2 == 0) {
          storeAPI.dispatch(
            sendNotification({
              id: uuidv4(),
              level: "warning",
              message: `No connection to the multiplayer server. Trying to reconnect.`,
            })
          );
        }
        currentReconnectCount = currentReconnectCount + 1;

        ws = null;
        setTimeout(() => {
          setup();
        }, RECONNECT_RETRY_MS);
      } else {
        storeAPI.dispatch(
          sendNotification({
            id: uuidv4(),
            level: "warning",
            message: `Lost connection to the multiplayer server. Try refreshing the page.`,
          })
        );
      }
    });

    ws.addEventListener("error", () => {
      log.warn("WS connection errored");
      // storeAPI.dispatch(
      //   sendNotification({
      //     id: uuidv4(),
      //     level: "error",
      //     message: `There was a problem with the multiplayer server connection. Multiplayer games are unavailable`,
      //   })
      // );

      ws?.close();
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
              !Object.keys(currentPlayerNumbers).includes(
                data.payload.playerRef
              )
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
          case "playerleft":
            const playerNums = getPlayerNumbers(storeAPI.getState());
            const playerNumToRemove = playerNums[data.payload.playerRef];
            storeAPI.dispatch(removePlayer(data.payload.playerRef));
            storeAPI.dispatch(
              sendNotification({
                id: uuidv4(),
                level: "info",
                message: `Player number ${playerNumToRemove} left the game`,
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
  };

  setup();

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
      ws?.send(
        JSON.stringify({
          type: "newgame",
          payload: { playerRef: myPeerRef },
        })
      );
    } else if (action.type === connectToRemoteGame.type) {
      const validate = /^[a-zA-Z]+-[a-zA-Z]+-[a-zA-Z]+$/;
      if (!validate.test(action.payload)) {
        console.error(`The game ${action.payload} is not a valid game name`);
        storeAPI.dispatch(
          sendNotification({
            id: uuidv4(),
            level: "warning",
            message: `The game ${action.payload} is not a valid game name.`,
          })
        );
        return;
      }
      log.debug("going to connect to game " + action.payload);
      ws?.send(
        JSON.stringify({
          type: "connecttogame",
          payload: { game: action.payload, playerRef: myPeerRef },
        })
      );
      // setupConnection(activeCon, storeAPI);
    } else if (action.type === requestResync.type) {
      if (!!ws?.OPEN && !!mpGameName) {
        ws?.send(
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
      !!ws?.OPEN &&
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
