import { Component } from "react";
import * as React from "react";
import Peer from "peerjs";
interface IProps {
  complete: () => void;
}

class PeerConnector extends Component<IProps> {
  public inputRef: HTMLInputElement | null = null;
  public peer: Peer = new Peer();
  public conn: Peer.DataConnection | null = null;

  constructor(props: any) {
    super(props);
    this.peer = new Peer();
    this.peer.on("error", (err) => {
      console.log("error");
      console.log(err);
    });
  }

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

    this.conn = this.peer.connect(this.inputRef?.value ?? "");

    this.conn.on("open", () => {
      console.log("connection opened");
      if (!this.conn) {
        return;
      }
      // Receive messages
      this.conn.on("data", (data) => {
        console.log("Client Received", data);
      });

      console.log("sending Hello");
      // Send messages
      this.conn.send("Hello!");
    });
  };

  private cancelBubble = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
  };
}

export default PeerConnector;
