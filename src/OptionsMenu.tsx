import { Component } from "react";
import "./OptionsMenu.scss";
//Icons
import MoreVertIcon from "@material-ui/icons/MoreVert";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import SelectAllIcon from "@material-ui/icons/SelectAll";
import GridOnIcon from "@material-ui/icons/GridOn";
import InfoIcon from "@material-ui/icons/Info";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import PanToolIcon from "@material-ui/icons/PanTool";

import { GameType } from "./constants/app-constants";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";
import { Vector2d } from "konva/lib/types";
import cx from "classnames";
import Tooltip from "@mui/material/Tooltip";

interface IProps {
  anyCardsSelected: boolean;
  currentGameType: GameType | null;
  panMode: boolean;
  multiselectMode: boolean;
  drawCardsIntoHand: boolean;
  snapCardsToGrid: boolean;
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
  showContextMenuAtPosition: (payload: Vector2d) => void;
  undo: () => void;
  redo: () => void;
  toggleDrawCardsIntoHand: () => void;
  toggleSnapCardsToGrid: () => void;
}
class OptionsMenu extends Component<IProps> {
  render() {
    return (
      <div className="options-menu">
        <button
          className={"render-touch-only"}
          onClick={() => {
            this.props.showContextMenuAtPosition({ x: 0, y: 0 });
          }}
        >
          <MoreVertIcon fontSize="large" />
        </button>
        <Tooltip title="Toggle Pan Mode">
          <button
            className={cx({ "toggle-on": this.props.panMode })}
            onClick={() => {
              this.props.togglePanMode();
            }}
          >
            <OpenWithIcon fontSize="large" />
          </button>
        </Tooltip>
        <Tooltip title="Toggle Draw Cards into Hand">
          <button
            className={cx({ "toggle-on": this.props.drawCardsIntoHand })}
            onClick={() => {
              this.props.toggleDrawCardsIntoHand();
            }}
          >
            <PanToolIcon fontSize="large" />
          </button>
        </Tooltip>
        <Tooltip title="Toggle Snap To Grid">
          <button
            className={cx({ "toggle-on": this.props.snapCardsToGrid })}
            onClick={() => {
              this.props.toggleSnapCardsToGrid();
            }}
          >
            <GridOnIcon fontSize="large" />
          </button>
        </Tooltip>
        <button
          className={cx("render-touch-only", {
            "toggle-on": this.props.multiselectMode,
          })}
          onClick={() => {
            this.props.toggleMultiselectMode();
          }}
        >
          <SelectAllIcon fontSize="large" />
        </button>
        <button
          className={"render-touch-only"}
          onClick={() => {
            if (this.props.anyCardsSelected) {
              this.props.showRadialMenuAtPosition({
                x: 64,
                y: window.visualViewport.height / 2,
              });
            }
          }}
        >
          <InfoIcon fontSize="large" />
        </button>
        <Tooltip title="Undo">
          <button
            onClick={() => {
              if (this.props.undo) {
                this.props.undo();
              }
            }}
          >
            <UndoIcon fontSize="large" />
          </button>
        </Tooltip>
        <Tooltip title="Redo">
          <button
            onClick={() => {
              if (this.props.redo) {
                this.props.redo();
              }
            }}
          >
            <RedoIcon fontSize="large" />
          </button>
        </Tooltip>
      </div>
    );
  }
}

export default OptionsMenu;
