import { Component } from "react";
import * as React from "react";

interface IProps {
  loadDeckId: (id: number) => void;
}

class DeckLoader extends Component<IProps> {
  render() {
    return (
      <input
        onKeyDown={this.handleKeyDown}
        onClick={this.cancelBubble}
        type="number"
      ></input>
    );
  }

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };

  private handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.props.loadDeckId(+event.currentTarget.value);
    }
  };
}

export default DeckLoader;
