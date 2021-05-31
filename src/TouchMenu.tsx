import IconButton from "@material-ui/core/IconButton";
import * as React from "react";
import { Component } from "react";
import "./TouchMenu.scss";
//Icons
import OpenWithIcon from "@material-ui/icons/OpenWith";
import SelectAllIcon from "@material-ui/icons/SelectAll";
import InfoIcon from "@material-ui/icons/Info";

import { GameType } from "./constants/app-constants";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { Vector2d } from "konva/lib/types";

interface IProps {
  anyCardsSelected: boolean;
  currentGameType: GameType | null;
  panMode: boolean;
  multiselectMode: boolean;
  togglePanMode: () => void;
  toggleMultiselectMode: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
  }) => void;
  shuffleStack: (id?: string) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }) => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
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
          className={this.props.multiselectMode ? "toggle-on" : ""}
          onClick={() => {
            this.props.toggleMultiselectMode();
          }}
        >
          <SelectAllIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={() => {
            if (this.props.anyCardsSelected) {
              this.props.showRadialMenuAtPosition({ x: 0, y: 0 });
            }
          }}
        >
          <InfoIcon fontSize="large" />
        </IconButton>
      </div>
    );
  }
}

export default TouchMenu;
