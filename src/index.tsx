/// <reference types="@welldone-software/why-did-you-render" />
import "./wdyr"; // <--- first import
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { Provider } from "react-redux";
import configureStore from "./store/configureStore";
import AppContainer from "./AppContainer";
import { ErrorBoundary } from "@highlight-run/react";
import { ConfirmProvider } from "material-ui-confirm";

const store = configureStore();
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <React.StrictMode>
      <Provider store={store}>
        <ConfirmProvider>
          <AppContainer />
        </ConfirmProvider>
      </Provider>
    </React.StrictMode>
  </ErrorBoundary>
);
