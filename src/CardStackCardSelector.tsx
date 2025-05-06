import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import cx from "classnames";
import Fuse from "fuse.js";
import React, { useState, useEffect, useCallback } from "react";
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

const CardStackCardSelector: React.FC<IProps> = (props) => {
  const [currentSearchString, setCurrentSearchString] = useState("");

  useEffect(() => {
    return () => {
      props.clearPreview();
    };
  }, [props]);

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSearchString("");
  }, []);

  const handleSearchTermChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentSearchString(event.target.value);
    },
    []
  );

  const cancelBubble = useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
  }, []);

  const haystack = props.card.cardStack.map((details) => ({
    jsonId: details.jsonId,
    name: props.cardsDataEntities[details.jsonId].name,
  }));

  let filteredResults = haystack;

  if (currentSearchString !== "") {
    const options = {
      keys: ["name"], // Search in `name`
    };

    const f = new Fuse(haystack, options);
    filteredResults = f.search(currentSearchString).map((r) => r.item);
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
      completed={props.completed}
    >
      <div className="card-selector-wrapper">
        <div className="text-field-wrapper">
          <div className="text-field-background">
            <TextField
              value={currentSearchString}
              variant="outlined"
              onClick={cancelBubble}
              onKeyDown={cancelBubble}
              onKeyUp={cancelBubble}
              onChange={handleSearchTermChange}
            ></TextField>
          </div>
          <Button variant="contained" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="card-images-selector">
          {filteredResults.map((cardDetails, index) => {
            const imgUrl =
              getImgUrlsFromJsonId(
                cardDetails.jsonId,
                true,
                props.cardsDataEntities,
                props.currentGameType
              )[0] ?? "missing";

            const cardType = getCardTypeWithoutStack(
              cardDetails.jsonId,
              true,
              props.cardsDataEntities
            );

            let shouldRotate = shouldRenderImageHorizontal(
              cardDetails.jsonId,
              cardType,
              GameManager.horizontalCardTypes[
                props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
              ],
              imgUrl.includes("back")
            );

            if (
              !!props.currentGameType &&
              GameManager.getModuleForType(props.currentGameType)
                .shouldRotateCard
            ) {
              shouldRotate = GameManager.getModuleForType(props.currentGameType)
                .shouldRotateCard!(cardDetails.jsonId, cardType, true);
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
                  props.cardSelected(cardDetails.jsonId);
                }}
                onDoubleClick={cancelBubble}
              ></img>
            );
          })}
        </div>
      </div>
    </TopLayer>
  );
};

export default CardStackCardSelector;
