import Peer, { DataConnection } from "peerjs";
import cloneDeep from "lodash.clonedeep";
import {
  adjectives,
  animals,
  colors,
  Config,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { myPeerRef } from "../constants/app-constants";
import {
  connectToRemoteGame,
  requestResync,
  setPeerId,
  setPlayerInfo,
} from "../features/game/game.slice";
import {
  receiveRemoteGameState,
  verifyRemoteGameState,
} from "./global.actions";
import { RootState } from "./rootReducer";
import { anyCardsDragging } from "../features/cards/cards.selectors";
import { blacklistRemoteActions } from "./middleware-utilities";
import loglevellog from "loglevel";

const STATE_CHECK_INTERVAL_MS = 5000;

const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) {
    loglevellog.debug(args[0], args[1]);
  }
};

const setupConnection = (conn: any, storeAPI: any) => {
  conn.on("data", (data: any) => {
    if (!data.INITIAL_STATE_MSG) {
      if (!!data.RESYNC) {
        log("received request for resync");
        conn.send({
          INITIAL_STATE_MSG: true,
          state: storeAPI.getState(),
        });
      } else if (!!data.PING) {
        // Check local state
        data.REMOTE_ACTION = true;
        storeAPI.dispatch(verifyRemoteGameState(data.state));
      } else {
        log("recieved remote action", data);
        data.REMOTE_ACTION = true;
        log("dispatching remote action", data);
        storeAPI.dispatch(data);
      }
    } else {
      loglevellog.debug("going to replace (most of) state with", data.state);
      setTimeout(() => {
        storeAPI.dispatch(receiveRemoteGameState(data.state));
      }, 0);
    }
  });
};

export const peerJSMiddleware = (storeAPI: any) => {
  const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "lowerCase",
  };
  const gameName = uniqueNamesGenerator(customConfig);
  const cgpPeer = new Peer(gameName, { debug: 2 });

  let activeCon: DataConnection;

  cgpPeer.on("error", (err) => {
    loglevellog.error("*****************Server error");
    loglevellog.error(err);
  });

  cgpPeer.on("disconnected", () => {
    loglevellog.debug("****Peer server connection disconnected");
  });

  cgpPeer.on("open", (id) => {
    loglevellog.debug("My peer ID is: " + id);
    loglevellog.debug("myPeerRef is: " + myPeerRef);
    storeAPI.dispatch(setPeerId(id));

    //look for query param
    const remoteParamArray = window.location.href.split("remote=");
    if (remoteParamArray.length > 1) {
      const remoteId = remoteParamArray[1].split("&")[0];
      loglevellog.debug(
        "FOUND QUERY PARAM. Going to connect to peer " + remoteId
      );
      activeCon = cgpPeer.connect(remoteId, {
        metadata: { ref: myPeerRef },
      });
      setupConnection(activeCon, storeAPI);
    }
  });

  cgpPeer.on("connection", (conn) => {
    loglevellog.debug("Connection received!");
    activeCon = conn;
    setupConnection(activeCon, storeAPI);

    activeCon.on("open", () => {
      loglevellog.debug("connection ready for data");
      const stateToSend: RootState = cloneDeep(storeAPI.getState());
      // @ts-ignore
      delete stateToSend.cardsData;

      log("going to send initial state", stateToSend);

      activeCon.send({
        INITIAL_STATE_MSG: true,
        state: stateToSend,
      });
      // TODO: more complicated logic to handle multiple connections. Right now
      // this just changes the connecting client to blue
      const setPlayerInfoAction = setPlayerInfo({
        ref: activeCon.metadata.ref,
        color: "blue",
        playerNumber: 2,
      });
      activeCon.send(setPlayerInfoAction);
      activeCon.send(
        setPlayerInfo({
          ref: myPeerRef,
          color: "red",
          playerNumber: 1,
        })
      );
      storeAPI.dispatch(setPlayerInfoAction);

      // Set up periodic state verification
      setInterval(() => {
        const currentState: RootState = cloneDeep(storeAPI.getState());

        // only check state if no cards are moving
        if (anyCardsDragging(currentState)) {
          // @ts-ignore
          delete currentState.cardsData;

          activeCon.send({
            PING: true,
            state: currentState,
          });
        } else {
          loglevellog.debug(
            `Some card is dragging, not checking remote state sync`
          );
        }
      }, STATE_CHECK_INTERVAL_MS);
    });

    activeCon.on("error", (err) => {
      loglevellog.error("****************Connection error:", err);
    });

    activeCon.on("close", () => {
      loglevellog.debug(
        "******connection closed for ref " + activeCon.metadata.ref
      );
    });

    activeCon.peerConnection.onconnectionstatechange = (ev: Event) => {
      loglevellog.debug(`connection state changed`);
      loglevellog.debug(ev);
      loglevellog.debug(activeCon.peerConnection.connectionState);
      if (
        activeCon.peerConnection.connectionState === "closed" ||
        activeCon.peerConnection.connectionState === "disconnected"
      ) {
        loglevellog.debug(
          "Should be CLEARING CLIENT OWNED CARDS for " + activeCon.metadata.ref
        );
      }
    };
  });
  return (next: any) => (action: any) => {
    log("received local action", action);

    // If this isn't a REMOTE action, add our ref onto it
    if (!action.REMOTE_ACTION) {
      action.ACTOR_REF = myPeerRef;
    } else if (!action.ACTOR_REF) {
      loglevellog.error(`Received a REMOTE action without an ACTOR_REF:`);
      loglevellog.debug(action);
    }

    if (action.type === connectToRemoteGame.type) {
      loglevellog.debug("going to connect to peer " + action.payload);
      activeCon = cgpPeer.connect(action.payload, {
        reliable: true,
        metadata: { ref: myPeerRef },
      });
      setupConnection(activeCon, storeAPI);
    } else if (action.type === requestResync.type) {
      if (!!activeCon) {
        activeCon.send({ RESYNC: true });
      }
    }

    if (
      !action.REMOTE_ACTION &&
      !!activeCon &&
      !blacklistRemoteActions[action.type]
    ) {
      log("going to send action to peer!");
      activeCon.send(action);
    }

    return next(action);
  };
};
