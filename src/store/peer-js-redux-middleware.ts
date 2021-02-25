import Peer from "peerjs";
import { myPeerRef } from "../constants/app-constants";
import { togglePanMode } from "../features/cards/cards.slice";
import {
  loadCardsData,
  loadCardsDataForPack,
  loadCardsForEncounterSet,
} from "../features/cards-data/cards-data.slice";
import {
  clearPreviewCard,
  connectToRemoteGame,
  requestResync,
  setPeerId,
  setPlayerColor,
  setPreviewCardId,
  updatePosition,
  updateZoom,
} from "../features/game/game.slice";
import { receiveRemoteGameState } from "./global.actions";

const DEBUG = false;

const blacklistRemoteActions = {
  [connectToRemoteGame.type]: true,
  [updatePosition.type]: true,
  [updateZoom.type]: true,
  [setPreviewCardId.type]: true,
  [clearPreviewCard.type]: true,
  [togglePanMode.type]: true,
  [receiveRemoteGameState.type]: true,
  [requestResync.type]: true,
  [loadCardsData.type]: true,
  [loadCardsDataForPack.type]: true,
  [loadCardsForEncounterSet.type]: true,
};

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(args[0], args[1]);
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
      } else {
        log("recieved remote action", data);
        data.REMOTE_ACTION = true;
        log("dispatching remote action", data);
        storeAPI.dispatch(data);
      }
    } else {
      console.log("going to replace (most of) state with", data.state);
      setTimeout(() => {
        storeAPI.dispatch(receiveRemoteGameState(data.state));
      }, 0);
    }
  });
};

export const peerJSMiddleware = (storeAPI: any) => {
  const cgpPeer = new Peer(undefined, {
    debug: 0,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:numb.viagenie.ca",
          username: "webrtc@live.com",
          credential: "muazkh",
        },
      ],
    },
  });
  let activeCon: Peer.DataConnection;

  cgpPeer.on("error", (err) => {
    console.error("*****************Server error");
    console.error(err);
  });

  cgpPeer.on("disconnected", () => {
    console.log("****Peer server connection disconnected");
  });

  cgpPeer.on("open", (id) => {
    console.log("My peer ID is: " + id);
    storeAPI.dispatch(setPeerId(id));

    //look for query param
    const remoteParamArray = window.location.href.split("remote=");
    if (remoteParamArray.length > 1) {
      const remoteId = remoteParamArray[1].split("&")[0];
      console.log("FOUND QUERY PARAM. Going to connect to peer " + remoteId);
      activeCon = cgpPeer.connect(remoteId, {
        metadata: { ref: myPeerRef },
      });
      setupConnection(activeCon, storeAPI);
    }
  });

  cgpPeer.on("connection", (conn) => {
    console.log("Connection received!");
    activeCon = conn;
    setupConnection(activeCon, storeAPI);

    activeCon.on("open", () => {
      console.log("connection ready for data");
      log("going to send initial state", storeAPI.getState());
      activeCon.send({
        INITIAL_STATE_MSG: true,
        state: storeAPI.getState(),
      });
      // TODO: more complicated logic to handle multiple connections. Right now
      // this just changes the connecting client to blue
      const setPlayerColorAction = setPlayerColor({
        ref: activeCon.metadata.ref,
        color: "blue",
      });
      activeCon.send(setPlayerColorAction);
      activeCon.send(
        setPlayerColor({
          ref: myPeerRef,
          color: "red",
        })
      );
      storeAPI.dispatch(setPlayerColorAction);
    });

    activeCon.on("error", (err) => {
      console.error("****************Connection error:", err);
    });

    activeCon.on("close", () => {
      console.log("******connection closed for ref " + activeCon.metadata.ref);
    });

    activeCon.peerConnection.onconnectionstatechange = (ev: Event) => {
      console.log(`connection state changed`);
      console.log(ev);
      console.log(activeCon.peerConnection.connectionState);
      if (
        activeCon.peerConnection.connectionState === "closed" ||
        activeCon.peerConnection.connectionState === "disconnected"
      ) {
        console.log(
          "CLEARING CLIENT OWNED CARDS for " + activeCon.metadata.ref
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
      console.error(`Received a REMOTE action without an ACTOR_REF:`);
      console.log(action);
    }

    if (action.type === connectToRemoteGame.type) {
      console.log("going to connect to peer " + action.payload);
      activeCon = cgpPeer.connect(action.payload, {
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
