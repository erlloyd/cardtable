import * as React from "react";
import { Component } from "react";

interface IProps {
  test?: string;
}

class ContextMenu extends Component<IProps> {
  render() {
    return <div>I'M A CONTEXT MENU</div>;
  }
}

export default ContextMenu;
