import IconButton from "@material-ui/core/IconButton";
import * as React from "react";
import { Component } from "react";
import "./TouchMenu.scss";
//Icons
import FlipIcon from "@material-ui/icons/Flip";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import AutorenewIcon from "@material-ui/icons/Autorenew";

interface IProps {
  panMode: boolean;
  togglePanMode: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
}
class TouchMenu extends Component<IProps> {
  render() {
    return (
      <div className="touch-menu">
        <IconButton
          className={this.props.panMode ? "toggle-on" : ""}
          onClick={() => {
            this.props.togglePanMode();
          }}
        >
          <OpenWithIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={() => {
            this.props.flipCards();
          }}
        >
          <FlipIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={() => {
            this.props.exhaustCard();
          }}
        >
          <AutorenewIcon fontSize="large" />
        </IconButton>
      </div>
    );
  }
}

export default TouchMenu;
