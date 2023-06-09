/// <reference types="@welldone-software/why-did-you-render" />
import "./wdyr"; // <--- first import
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { Provider } from "react-redux";
import configureStore from "./store/configureStore";
import AppContainer from "./AppContainer";
import { ErrorBoundary } from "@highlight-run/react";

const store = configureStore();

ReactDOM.render(
  <ErrorBoundary>
    <React.StrictMode>
      <Provider store={store}>
        <AppContainer />
      </Provider>
    </React.StrictMode>
  </ErrorBoundary>,
  document.getElementById("root")
);
