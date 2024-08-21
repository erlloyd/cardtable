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
  endUndoRedo,
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
import {
  sendAndForceNotification,
  sendNotification,
} from "../features/notifications/notifications.slice";
import { RootState } from "./rootReducer";
import { anyCardsDragging } from "../features/cards/cards.selectors";
import { CardData } from "../external-api/common-card-data";
import { addRawCardsData } from "../features/cards-data/cards-data.slice";
import { GameType } from "../game-modules/GameType";
import merge from "lodash.merge";
import pick from "lodash.pick";
import GameManager from "../game-modules/GameModuleManager";
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

const sendResync = (ws: WebSocket | null, mpGameName: string, action: any) => {
  if (!!ws?.OPEN && !!mpGameName) {
    ws?.send(
      JSON.stringify({
        type: "resync",
        game: mpGameName,
        payload: {
          RESYNC: true,
          CUSTOM_CARDS: action.payload.includeCustomCards,
          CURRENT_GAME_TYPE: action.CURRENT_GAME_TYPE,
        },
      })
    );
  }
};

const sendInitialStateMessage = (
  storeAPI: any,
  action: any,
  ws: WebSocket | null
) => {
  const { cardsData: _, ...stateWithoutCardsData } = storeAPI.getState();
  const customCardString = action.CUSTOM_CARDS
    ? localStorage.getItem("cardtable-custom-cards")
    : null;

  let customCardsObject = customCardString
    ? JSON.parse(customCardString)
    : undefined;

  if (customCardsObject && action.CURRENT_GAME_TYPE) {
    customCardsObject = pick(customCardsObject, action.CURRENT_GAME_TYPE);
  }

  ws?.send(
    JSON.stringify({
      type: "remoteaction",
      game: getMultiplayerGameName(storeAPI.getState()),
      payload: {
        INITIAL_STATE_MSG: true,
        state: stateWithoutCardsData,
        customCards: customCardsObject,
      },
    })
  );
};

export const websocketMiddleware = (storeAPI: any) => {
  const handleRemoteAction = (action: any) => {
    // console.log("remote action", action);
    if (!action.INITIAL_STATE_MSG) {
      if (!!action.RESYNC) {
        sendInitialStateMessage(storeAPI, action, ws);
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
        // first check if we are about to try to load
        // a custom game we know nothing about.....
        const aboutToLoadGameType = (action.state as RootState).game
          .activeGameType;

        // if we're about to load a null game type, just don't
        if (!aboutToLoadGameType) {
          return;
        }

        // if we're about to load a game type that we don't have, error
        if (
          aboutToLoadGameType &&
          !GameManager.properties[aboutToLoadGameType]
        ) {
          storeAPI.dispatch(
            sendAndForceNotification({
              id: uuidv4(),
              level: "error",
              message: `Unable to connect to game. The current game is a custom game you haven't added to Cardtable.`,
            })
          );

          return;
        }

        // store the custom cards in localstorage
        let existingCustomCards: {
          [key: string]: {
            [key: string]: { card: CardData; playerCard: boolean };
          };
        } | null = JSON.parse(
          localStorage.getItem("cardtable-custom-cards") ?? "{}"
        );
        if (!existingCustomCards) {
          existingCustomCards = {};
        }

        if (action.customCards) {
          Object.entries(action.customCards).forEach(
            ([gameType, customCards]) => {
              //split into player and non-player
              const playerCards = Object.values(customCards as any)
                .filter((c: any) => c.playerCard)
                .map((c: any) => c.card);
              storeAPI.dispatch(
                addRawCardsData({
                  gameType: gameType as GameType,
                  cards: playerCards,
                  storeAsPlayerCards: true,
                })
              );

              const nonPlayerCards = Object.values(customCards as any)
                .filter((c: any) => !c.playerCard)
                .map((c: any) => c.card);
              storeAPI.dispatch(
                addRawCardsData({
                  gameType: gameType as GameType,
                  cards: nonPlayerCards,
                  storeAsPlayerCards: false,
                })
              );
            }
          );

          // Now store in localstorage
          const newCustomCards = merge(existingCustomCards, action.customCards);
          localStorage.setItem(
            "cardtable-custom-cards",
            JSON.stringify(newCustomCards)
          );
        }

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
        clearInterval(stateCheckTimer as any); // any cast due to TS typing weirdness..
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
        clearInterval(stateCheckTimer as any); // any cast due to TS typing weirdness..
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
            storeAPI.dispatch(requestResync({ includeCustomCards: false }));
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
              newPlayerColors[data.payload.playerRef] = playerColorByNum.color;
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
      sendResync(ws, mpGameName, action);
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

      //if we are done undoing / redoing send the state if we
      // have a multiplayer game
      if (!!mpGameName && action.type === endUndoRedo.type) {
        sendInitialStateMessage(storeAPI, action, ws);
      }
    }

    return next(action);
  };
};
