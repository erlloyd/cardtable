import throttle from "lodash.throttle";
import {
  configureStore as rtkConfigureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { saveState } from "./localStorage";
import Peer from "peerjs";

const CGP_PEER = new Peer();

CGP_PEER.on("error", (err) => {
  console.log("server error");
  console.log(err);
});

CGP_PEER.on("open", (id) => {
  console.log("My peer ID is: " + id);
});

CGP_PEER.on("connection", (conn) => {
  console.log("Connection made!");
  conn.on("data", (data) => {
    console.log("Server Received", data);
  });
});

const customizedMiddleware = getDefaultMiddleware({
  thunk: true,
  immutableCheck: false,
  serializableCheck: false,
});

export default function configureStore() {
  const store = rtkConfigureStore({
    reducer: rootReducer,
    middleware: customizedMiddleware,
  });

  store.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000)
  );

  return store;
}
