import Peer from "peerjs";
import { fetchDecklistById } from "../features/cards/cards.async-thunks";
import { exhaustCard } from "../features/cards/cards.slice";
import { connectToRemoteGame } from "../features/game/game.slice";

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
  const CGP_PEER = new Peer();
  let activeCon: Peer.DataConnection;
  CGP_PEER.on("error", (err) => {
    console.log("server error");
    console.log(err);
  });

  CGP_PEER.on("open", (id) => {
    console.log("My peer ID is: " + id);
  });

  CGP_PEER.on("connection", (conn) => {
    console.log("Connection received!");
    activeCon = conn;
    setupConnection(activeCon, storeAPI);
  });
  return (next: any) => (action: any) => {
    console.log("received local action", action);

    if (
      !action.REMOTE_ACTION &&
      !!activeCon &&
      (action.type === exhaustCard.type ||
        action.type === fetchDecklistById.fulfilled.type)
    ) {
      console.log("going to send action to peer!");
      activeCon.send(action);
    }

    if (action.type === connectToRemoteGame.type) {
      console.log("going to connect to peer " + action.payload);
      activeCon = CGP_PEER.connect(action.payload);
      setupConnection(activeCon, storeAPI);
    }

    return next(action);
  };
};
