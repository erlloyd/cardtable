import {
  configureStore as rtkConfigureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const customizedMiddleware = getDefaultMiddleware({
  thunk: false,
});

export default function configureStore() {
  return rtkConfigureStore({
    reducer: rootReducer,
    middleware: customizedMiddleware,
  });
}
