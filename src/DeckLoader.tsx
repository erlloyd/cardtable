import { Component } from "react";
import * as React from "react";
import TextField from "@mui/material/TextField";

interface IProps {
  loadDeckId: (id: number) => void;
}

class DeckLoader extends Component<IProps> {
  inputValue: string = "";

  private focusInputField = (input: any) => {
    if (input) {
      setTimeout(() => {
        input.querySelector("input").focus();
      }, 100);
    }
  };

  render() {
    return (
      <div
        onClick={this.cancelBubble}
        onKeyPress={this.cancelBubble}
        className="token-field-row"
      >
        <TextField
          ref={this.focusInputField}
          label="Enter Online Deck ID"
          onKeyPress={this.handleKeyPress}
          onClick={this.cancelBubble}
          onChange={(event) => {
            this.inputValue = event.target.value;
          }}
          type="number"
          variant="outlined"
        ></TextField>{" "}
      </div>
    );
  }

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  private handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLocaleLowerCase() === "enter") {
      this.props.loadDeckId(+this.inputValue);
    }
  };
}

export default DeckLoader;
