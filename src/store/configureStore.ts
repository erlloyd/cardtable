import throttle from "lodash.throttle";
import {
  configureStore as rtkConfigureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { saveState } from "./localStorage";
import { websocketMiddleware } from "./websocket-server-multiplayer-middleware";
import { peerJSMiddleware } from "./peer-js-redux-middleware";
import log from "loglevel";
import { useWebRTCLocalStorage } from "../constants/app-constants";

const baseCustomizedMiddleware = getDefaultMiddleware({
  thunk: true,
  immutableCheck: false,
  serializableCheck: false,
});

const wsCustomizedMiddleware =
  baseCustomizedMiddleware.concat(websocketMiddleware);
const peerJSCustomizedMiddleware =
  baseCustomizedMiddleware.concat(peerJSMiddleware);

export default function configureStore() {
  log.debug("configuring store. NODE_ENV is " + import.meta.env.MODE);
  const store = rtkConfigureStore({
    reducer: rootReducer,
    middleware: useWebRTCLocalStorage
      ? peerJSCustomizedMiddleware
      : wsCustomizedMiddleware,
    devTools:
      import.meta.env.MODE !== "production"
        ? {
            stateSanitizer: (state) =>
              (state as any).cardsData
                ? { ...state, cardsData: "<<LOTS OF DATA>>" }
                : state,
          }
        : false,
  });

  store.subscribe(
    throttle(() => {
      saveState(store.getState());
    }, 1000)
  );

  (window as any).cardTableStore = store;

  return store;
}
