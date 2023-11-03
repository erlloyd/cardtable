import React from "react";
import whyDidYouRender from "@welldone-software/why-did-you-render";

const runWDYR = false;

if (runWDYR && import.meta.env.MODE === "development") {
  whyDidYouRender(React, {
    trackAllPureComponents: false,
  });
}
