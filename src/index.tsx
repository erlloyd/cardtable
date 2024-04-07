/// <reference types="@welldone-software/why-did-you-render" />
import "./wdyr"; // <--- first import
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { Provider } from "react-redux";
import configureStore from "./store/configureStore";
import AppContainer from "./AppContainer";
import { ErrorBoundary } from "@highlight-run/react";
import { ConfirmProvider } from "material-ui-confirm";

const store = configureStore();

ReactDOM.render(
  <ErrorBoundary>
    <React.StrictMode>
      <Provider store={store}>
        <ConfirmProvider>
          <AppContainer />
        </ConfirmProvider>
      </Provider>
    </React.StrictMode>
  </ErrorBoundary>,
  document.getElementById("root")
);
