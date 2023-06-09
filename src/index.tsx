/// <reference types="@welldone-software/why-did-you-render" />
import "./wdyr"; // <--- first import
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { Provider } from "react-redux";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import configureStore from "./store/configureStore";
import AppContainer from "./AppContainer";
import { ErrorBoundary } from "@highlight-run/react";

console.log("ERL");

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorkerRegistration.register();

// import React from "react";
// // import ReactDOM from "react-dom/client";
// import ReactDOM from "react-dom";
// import App from "./App";
// // import "./index.css";

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );
