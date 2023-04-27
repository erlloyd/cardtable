import { Component } from "react";
import * as React from "react";
import TextField from "@mui/material/TextField";
import CheckBox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";

interface IProps {
  loadDeckId: (id: number, usePrivateApi: boolean) => void;
  showPrivateApiOption: boolean;
}

class DeckLoader extends Component<IProps> {
  deckId: string = "";
  privateApiSelected: boolean = false;

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
            this.deckId = event.target.value;
          }}
          type="number"
          variant="outlined"
        ></TextField>{" "}
        <div hidden={!this.props.showPrivateApiOption}>
          <FormControlLabel
            label="Use Private Deck ID?"
            control={
              <CheckBox
                onChange={(event) => {
                  this.privateApiSelected = event.currentTarget.checked;
                }}
              />
            }
          ></FormControlLabel>
        </div>
      </div>
    );
  }

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  private handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLocaleLowerCase() === "enter") {
      this.props.loadDeckId(+this.deckId, this.privateApiSelected);
    }
  };
}

export default DeckLoader;
