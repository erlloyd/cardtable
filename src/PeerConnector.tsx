import { Component } from "react";
import * as React from "react";
interface IProps {
  connect: (peerId: string) => void;
}

class PeerConnector extends Component<IProps> {
  public inputRef: HTMLInputElement | null = null;

  render() {
    return (
      <div onClick={this.cancelBubble}>
        <input
          ref={(ref) => {
            if (!ref) return;
            this.inputRef = ref;
          }}
        ></input>
        <button onClick={this.connect}>Connect</button>
      </div>
    );
  }

  private connect = (_event: any) => {
    console.log("connecting with peer id " + this.inputRef?.value);

    this.props.connect(this.inputRef?.value || "");
  };

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };
}

export default PeerConnector;
