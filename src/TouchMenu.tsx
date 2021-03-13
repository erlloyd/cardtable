import IconButton from "@material-ui/core/IconButton";
import * as React from "react";
import { Component } from "react";
import "./TouchMenu.scss";
//Icons
import FlipIcon from "@material-ui/icons/Flip";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import { GameType } from "./constants/app-constants";
import {
  GamePropertiesMap,
  NumericTokenInfo,
  TokenInfo,
} from "./constants/game-type-properties-mapping";
import Button from "@material-ui/core/Button";
import { StatusTokenType } from "./constants/card-constants";

interface IProps {
  currentGameType: GameType | null;
  panMode: boolean;
  togglePanMode: () => void;
  flipCards: () => void;
  exhaustCard: (id?: string) => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
  }) => void;
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
        {this.renderStatusCardButtons()}
      </div>
    );
  }

  private renderStatusCardButtons = () => {
    if (!this.props.currentGameType) {
      return null;
    }
    return Object.values(GamePropertiesMap[this.props.currentGameType].tokens)
      .filter(
        (tokenInfo): tokenInfo is TokenInfo | NumericTokenInfo => !!tokenInfo
      )
      .map((tokenInfo) => {
        let action: () => void;
        if ((tokenInfo as NumericTokenInfo).isNumeric) {
          action = () => {};
        } else {
          action = () => {
            this.props.toggleToken({
              tokenType: (tokenInfo as TokenInfo).tokenType,
            });
          };
        }

        if (!!tokenInfo.touchMenuIcon) {
          return (
            <IconButton onClick={action}>{tokenInfo.touchMenuIcon}</IconButton>
          );
        } else if (!!tokenInfo.touchMenuLetter) {
          return (
            <Button onClick={action} className="text-button">
              {tokenInfo.touchMenuLetter}
            </Button>
          );
        }
        return null;
      });
  };
}

export default TouchMenu;
