import { Component } from "react";
import * as React from "react";

interface IProps {}

class EncounterLoader extends Component<IProps> {
  render() {
    return <input onClick={this.cancelBubble}></input>;
  }

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };
}

export default EncounterLoader;
