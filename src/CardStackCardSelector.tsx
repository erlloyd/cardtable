import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import cx from "classnames";
import Fuse from "fuse.js";
import * as React from "react";
import { Component } from "react";
import "./CardStackCardSelector.scss";
import TopLayer from "./TopLayer";
import { ICardData } from "./features/cards-data/initialState";
import { ICardStack } from "./features/cards/initialState";
import GameManager from "./game-modules/GameModuleManager";
import { GameType } from "./game-modules/GameType";
import {
  getCardTypeWithoutStack,
  getImgUrlsFromJsonId,
  shouldRenderImageHorizontal,
} from "./utilities/card-utils";

interface IProps {
  currentGameType: GameType;
  cardsDataEntities: ICardData;
  card: ICardStack;
  cardSelected: (jsonId: string) => void;
  preview: (payload: { id: string; modal?: boolean }) => void;
  clearPreview: () => void;
  completed: () => void;
  touchBased: boolean;
}

interface IState {
  currentSearchString: string;
}

class CardStackCardSelector extends Component<IProps, IState> {
  static whyDidYouRender = false;

  constructor(props: IProps) {
    super(props);

    this.state = {
      currentSearchString: "",
    };
  }

  componentWillUnmount() {
    this.props.clearPreview();
  }

  render() {
    const haystack = this.props.card.cardStack.map((details) => ({
      jsonId: details.jsonId,
      name: this.props.cardsDataEntities[details.jsonId].name,
    }));

    let filteredResults = haystack;

    if (this.state.currentSearchString !== "") {
      const options = {
        // Search in `name`
        keys: ["name"],
      };

      const f = new Fuse(haystack, options);
      filteredResults = f
        .search(this.state.currentSearchString)
        .map((r) => r.item);
    }
    return (
      <TopLayer
        staticPosition={true}
        trasparentBackground={true}
        blurBackground={true}
        offsetContent={false}
        position={{ x: 0, y: 0 }}
        noPadding={true}
        fullHeight={true}
        fullWidth={true}
        completed={this.props.completed}
      >
        <div className="card-selector-wrapper">
          <div className="text-field-wrapper">
            <div className="text-field-background">
              <TextField
                value={this.state.currentSearchString}
                variant="outlined"
                onClick={this.cancelBubble}
                onKeyDown={this.cancelBubble}
                onKeyUp={this.cancelBubble}
                onChange={this.handleSearchTermChange}
              ></TextField>
            </div>
            <Button variant="contained" onClick={this.handleReset}>
              Reset
            </Button>
          </div>

          <div className="card-images-selector">
            {filteredResults.map((cardDetails, index) => {
              const imgUrl =
                getImgUrlsFromJsonId(
                  cardDetails.jsonId,
                  true,
                  this.props.cardsDataEntities,
                  this.props.currentGameType
                )[0] ?? "missing";

              const cardType = getCardTypeWithoutStack(
                cardDetails.jsonId,
                true,
                this.props.cardsDataEntities
              );

              let shouldRotate = shouldRenderImageHorizontal(
                cardDetails.jsonId,
                cardType,
                GameManager.horizontalCardTypes[
                  this.props.currentGameType ??
                    GameManager.allRegisteredGameTypes[0]
                ],
                imgUrl.includes("back")
              );

              if (
                !!this.props.currentGameType &&
                GameManager.getModuleForType(this.props.currentGameType)
                  .shouldRotateCard
              ) {
                shouldRotate = GameManager.getModuleForType(
                  this.props.currentGameType
                ).shouldRotateCard!(cardDetails.jsonId, cardType, true);
              }

              return (
                <img
                  key={`full-hand-image-${cardDetails.jsonId}-${index}`}
                  className={cx({
                    "full-hand-img": true,
                    "rotate-card": shouldRotate,
                  })}
                  src={imgUrl}
                  onClick={() => {
                    this.props.cardSelected(cardDetails.jsonId);
                  }}
                  onDoubleClick={this.cancelBubble}
                ></img>
              );
            })}
          </div>
        </div>
      </TopLayer>
    );
  }

  private handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    this.setState({ currentSearchString: "" });
  };

  private handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({ currentSearchString: event.target.value });
  };

  private cancelBubble = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };
}

export default CardStackCardSelector;
