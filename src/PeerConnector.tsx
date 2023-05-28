import { Component } from "react";
import * as React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import log from "loglevel";
interface IProps {
  connect: (peerId: string) => void;
}

class PeerConnector extends Component<IProps> {
  static whyDidYouRender = true;
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
        onClick={this.cancelBubble}
        onKeyDown={this.cancelBubble}
      >
        <TextField
          label="Enter peer id"
          autoCapitalize="none"
          ref={this.focusInputField}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              this.connect(event);
            }
          }}
          onClick={this.cancelBubble}
          onChange={(event) => {
            this.inputValue = event.target.value;
          }}
          variant="outlined"
        ></TextField>
        <Button variant="outlined" onClick={this.connect}>
          Connect
        </Button>
      </div>
    );
  }

  private connect = (_event: any) => {
    log.debug("connecting with peer id " + this.inputValue);

    this.props.connect(this.inputValue || "");
  };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default PeerConnector;
