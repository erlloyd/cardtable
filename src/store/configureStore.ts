import throttle from "lodash.throttle";
import { configureStore as rtkConfigureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { saveState } from "./localStorage";
import { websocketMiddleware } from "./websocket-server-multiplayer-middleware";
import { peerJSMiddleware } from "./peer-js-redux-middleware";
import log from "loglevel";
import { useWebRTCLocalStorage } from "../constants/app-constants";
import { addCurrentGameTypeMiddleware } from "./addCurrentGameTypeMiddleware";

export default function configureStore() {
  log.debug("configuring store. NODE_ENV is " + import.meta.env.MODE);
  const store = rtkConfigureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      const baseCustomizedMiddleware = getDefaultMiddleware({
        thunk: true,
        immutableCheck: false,
        serializableCheck: false,
      }).concat(addCurrentGameTypeMiddleware);

      const wsCustomizedMiddleware =
        baseCustomizedMiddleware.concat(websocketMiddleware);
      const peerJSCustomizedMiddleware =
        baseCustomizedMiddleware.concat(peerJSMiddleware);

      if (useWebRTCLocalStorage) {
        return peerJSCustomizedMiddleware;
      } else {
        return wsCustomizedMiddleware;
      }
    },
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
