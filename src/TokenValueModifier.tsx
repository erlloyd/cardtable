import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import * as React from "react";
import { Component } from "react";

interface IProps {
  id: string;
  tokenType: string;
  updated: (payload: { id: string; tokenType: string; value: number }) => void;
}

class TokenValueModifier extends Component<IProps> {
  static whyDidYouRender = false;
  inputValue: string = "0";

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
          onKeyPress={this.handleKeyPress}
          variant="outlined"
          type="number"
          onChange={(event) => {
            this.inputValue = event.target.value;
          }}
        ></TextField>
        <Button
          onClick={this.handleClick}
          style={{ height: "56px", marginLeft: "5px" }}
          variant="outlined"
          color="primary"
        >
          Set
        </Button>
      </div>
    );
  }

  private handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const code = event.key.toLocaleLowerCase();
    if (code === "enter") {
      this.complete(+this.inputValue);
    }
  };

  private handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.complete(+this.inputValue);
  };

  private complete = (newValue: number) => {
    this.props.updated({
      id: this.props.id,
      tokenType: this.props.tokenType,
      value: newValue,
    });
  };

  // private preventDefault = (
  //   event: React.MouseEvent<HTMLElement, MouseEvent>
  // ) => {
  //   event.preventDefault();
  // };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default TokenValueModifier;
