import IconButton from "@material-ui/core/IconButton";
import * as React from "react";
import { Component } from "react";
import "./TouchMenu.scss";
//Icons
import FlipIcon from "@material-ui/icons/Flip";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import { GameType } from "./constants/app-constants";
import {
  GamePropertiesMap,
  NumericTokenInfo,
  TokenInfo,
} from "./constants/game-type-properties-mapping";
import Button from "@material-ui/core/Button";
import { CounterTokenType, StatusTokenType } from "./constants/card-constants";

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
  shuffleStack: (id?: string) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
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
        <IconButton
          onClick={() => {
            this.props.shuffleStack();
          }}
        >
          <ShuffleIcon fontSize="large" />
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
      .flatMap((tokenInfo) => {
        let returnVal = [];
        if ((tokenInfo as NumericTokenInfo).isNumeric) {
          const addTokenInfo = {
            ...tokenInfo,
            touchMenuLetter: `${tokenInfo.touchMenuLetter} +`,
          };
          const removeTokenInfo = {
            ...tokenInfo,
            touchMenuLetter: `${tokenInfo.touchMenuLetter} -`,
          };
          returnVal = [addTokenInfo, removeTokenInfo];
        } else {
          returnVal = [tokenInfo];
        }
        return returnVal;
      })
      .map((tokenInfo) => {
        let action: () => void;
        if ((tokenInfo as NumericTokenInfo).isNumeric) {
          action = () => {
            this.props.adjustCounterToken({
              tokenType: (tokenInfo as NumericTokenInfo).counterTokenType,
              delta: tokenInfo.touchMenuLetter?.indexOf("+") !== -1 ? 1 : -1,
            });
          };
        } else {
          action = () => {
            this.props.toggleToken({
              tokenType: (tokenInfo as TokenInfo).tokenType,
            });
          };
        }

        const key = `touch-menu-button-${tokenInfo.menuText
          .replace(/\s/g, "")
          .toLocaleLowerCase()}`;

        if (!!tokenInfo.touchMenuIcon) {
          return (
            <IconButton key={key} onClick={action}>
              {tokenInfo.touchMenuIcon}
            </IconButton>
          );
        } else if (!!tokenInfo.touchMenuLetter) {
          return (
            <Button key={key} onClick={action} className="text-button">
              {tokenInfo.touchMenuLetter}
            </Button>
          );
        }
        return null;
      });
  };
}

export default TouchMenu;
