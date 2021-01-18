import Peer from "peerjs";
import {
  hoverCard,
  hoverLeaveCard,
  togglePanMode,
} from "../features/cards/cards.slice";
import {
  connectToRemoteGame,
  updatePosition,
  updateZoom,
} from "../features/game/game.slice";
import { receiveRemoteGameState } from "./global.actions";

const DEBUG = false;

const blacklistRemoteActions = {
  [connectToRemoteGame.type]: true,
  [updatePosition.type]: true,
  [updateZoom.type]: true,
  [hoverCard.type]: true,
  [hoverLeaveCard.type]: true,
  [togglePanMode.type]: true,
  [receiveRemoteGameState.type]: true,
};

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(args[0], args[1]);
  }
};

const setupConnection = (conn: any, storeAPI: any) => {
  conn.on("data", (data: any) => {
    if (!data.INITIAL_STATE_MSG) {
      log("recieved remote action", data);
      data.REMOTE_ACTION = true;
      log("dispatching remote action", data);
      storeAPI.dispatch(data);
    } else {
      console.log("going to replace (most of) state with", data.state);
      setTimeout(() => {
        storeAPI.dispatch(receiveRemoteGameState(data.state));
      }, 0);
    }
  });
};

export const peerJSMiddleware = (storeAPI: any) => {
  const cgpPeer = new Peer(undefined, { debug: 0 });
  let activeCon: Peer.DataConnection;
  cgpPeer.on("error", (err) => {
    console.error("*****************Server error");
    console.error(err);
  });

  cgpPeer.on("disconnected", () => {
    console.log("****Peer connection disconnected");
  });

  cgpPeer.on("open", (id) => {
    console.log("My peer ID is: " + id);
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
    });

    activeCon.on("error", (err) => {
      console.error("****************Connection error:", err);
    });
  });
  return (next: any) => (action: any) => {
    log("received local action", action);

    if (
      !action.REMOTE_ACTION &&
      !!activeCon &&
      !blacklistRemoteActions[action.type]
    ) {
      log("going to send action to peer!");
      activeCon.send(action);
    }

    if (action.type === connectToRemoteGame.type) {
      console.log("going to connect to peer " + action.payload);
      activeCon = cgpPeer.connect(action.payload);
      setupConnection(activeCon, storeAPI);
    }

    return next(action);
  };
};
