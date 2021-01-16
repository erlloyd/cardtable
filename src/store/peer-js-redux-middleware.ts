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

const blacklistRemoteActions = {
  [connectToRemoteGame.type]: true,
  [updatePosition.type]: true,
  [updateZoom.type]: true,
  [hoverCard.type]: true,
  [hoverLeaveCard.type]: true,
  [togglePanMode.type]: true,
};

const setupConnection = (conn: any, storeAPI: any) => {
  conn.on("data", (data: any) => {
    console.log("recieved remote action", data);
    data.REMOTE_ACTION = true;
    console.log("dispatching remote action", data);
    storeAPI.dispatch(data);
  });
};

export const peerJSMiddleware = (storeAPI: any) => {
  console.log("MIDDLEWARE TOP LEVEL");
  const cgpPeer = new Peer();
  let activeCon: Peer.DataConnection;
  cgpPeer.on("error", (err) => {
    console.log("server error");
    console.log(err);
  });

  cgpPeer.on("open", (id) => {
    console.log("My peer ID is: " + id);
  });

  cgpPeer.on("connection", (conn) => {
    console.log("Connection received!");
    activeCon = conn;
    setupConnection(activeCon, storeAPI);
  });
  return (next: any) => (action: any) => {
    console.log("received local action", action);

    if (
      !action.REMOTE_ACTION &&
      !!activeCon &&
      !blacklistRemoteActions[action.type]
    ) {
      console.log("going to send action to peer!");
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
