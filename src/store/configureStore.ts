import throttle from "lodash.throttle";
import {
  configureStore as rtkConfigureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { saveState } from "./localStorage";
// import { websocketMiddleware } from "./websocket-server-multiplayer-middleware";
import { peerJSMiddleware } from "./peer-js-redux-middleware";

const customizedMiddleware = getDefaultMiddleware({
  thunk: true,
  immutableCheck: false,
  serializableCheck: false,
}).concat(peerJSMiddleware);
// .concat(websocketMiddleware);

export default function configureStore() {
  console.log("configuring store. NODE_ENV is " + process.env.NODE_ENV);
  const store = rtkConfigureStore({
    reducer: rootReducer,
    middleware: customizedMiddleware,
    devTools:
      process.env.NODE_ENV !== "production"
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
