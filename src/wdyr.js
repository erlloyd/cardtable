import React from "react";

const runWDYR = false;

if (runWDYR && import.meta.env.MODE === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: false,
  });
}
