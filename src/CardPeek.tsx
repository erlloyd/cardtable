import TopLayer from "./TopLayer";
import "./CardPeek.scss";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ICardStack } from "./features/cards/initialState";
import { ICardData } from "./features/cards-data/initialState";
import { GameType } from "./game-modules/GameType";
import cx from "classnames";
import {
  getCardTypeWithoutStack,
  getImgUrlsFromJsonId,
  shouldRenderImageHorizontal,
} from "./utilities/card-utils";
import GameManager from "./game-modules/GameModuleManager";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
} from "@mui/material";
import { useState } from "react";
interface IProps {
  currentGameType: GameType;
  cardsDataEntities: ICardData;
  visible: boolean;
  numToPeek: number | null;
  cardStack: ICardStack | null;
  hideCardPeek: () => {};
  reorderAndDrawCardsFromTop: (payload: {
    stackId: string;
    numCards: number;
    top: string[];
    bottom: string[];
    draw: string[];
    reveal: string[];
    randomTop: boolean;
    randomBottom: boolean;
  }) => void;
}

interface PeekedCardImageInfo {
  jsonId: string;
  img: HTMLImageElement | undefined;
  status: "loaded" | "loading" | "failed";
}

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (_isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  margin: `0 ${grid}px 0 0`,

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean, itemsLength: number) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  //position: "absolute",
  //float: "left",
  display: "flex",
  padding: grid,
  margin: 12,
  // height: "120px",
  height: "100%",
  overflow: "auto",
});

const CardPeek = (props: IProps) => {
  if (!props.visible) return null;

  const cards = props.cardStack?.cardStack ?? [];
  const peekedCards = cards.slice(0, props.numToPeek ?? 5);
  const peekedCardImgs = peekedCards.map((c, index) => ({
    jsonId: c.jsonId,
    imgUrl:
      getImgUrlsFromJsonId(
        c.jsonId,
        true,
        props.cardsDataEntities,
        props.currentGameType
      )[0] ?? "missing",
  }));

  const [newIndeces, setNewIndeces] = useState(
    Array.from(Array(peekedCards.length).keys())
  );

  const [randomTop, setRandomTop] = useState(false);
  const [randomBottom, setRandomBottom] = useState(false);

  const initialActionValues = peekedCardImgs.map(() => "top");

  let reorderedCardImgs: { jsonId: string; imgUrl: string }[] = [];

  newIndeces.forEach((i) => {
    reorderedCardImgs.push(peekedCardImgs[i]);
  });

  const [actionValues, setActionValues] = useState(initialActionValues);

  return (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      noPadding={true}
      fullHeight={true}
      fullWidth={true}
      completed={() => {}}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="card-peek-wrapper"
      >
        <div
          className="buttons"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="button-group">
            <Button
              style={{
                color: "white",
                borderColor: "white",
              }}
              variant={"outlined"}
              onClick={() => {
                setActionValues(actionValues.map((_) => "top"));
              }}
            >
              Set all to Top
            </Button>
            <Button
              variant={"outlined"}
              style={{
                color: "white",
                borderColor: "white",
              }}
              onClick={() => {
                setActionValues(actionValues.map((_) => "bottom"));
              }}
            >
              Set all to Bottom
            </Button>
          </div>
          <div className="button-group">
            <Button
              variant={"contained"}
              onClick={() => {
                //Get the cards that we are going to draw
                const cardsToDraw: string[] = [];
                const cardsToReveal: string[] = [];
                const cardsOnTop: string[] = [];
                const cardsOnBottom: string[] = [];

                reorderedCardImgs.forEach((imgInfo, i) => {
                  // get the action
                  const action = actionValues[i];

                  switch (action) {
                    case "top":
                      cardsOnTop.push(imgInfo.jsonId);
                      break;
                    case "bottom":
                      cardsOnBottom.push(imgInfo.jsonId);
                      break;
                    case "draw":
                      cardsToDraw.push(imgInfo.jsonId);
                      break;
                    case "reveal":
                      cardsToReveal.push(imgInfo.jsonId);
                      break;
                  }
                });

                if (props.cardStack?.id) {
                  props.reorderAndDrawCardsFromTop({
                    stackId: props.cardStack?.id,
                    numCards: reorderedCardImgs.length,
                    top: cardsOnTop,
                    bottom: cardsOnBottom,
                    draw: cardsToDraw,
                    reveal: cardsToReveal,
                    randomTop,
                    randomBottom,
                  });
                } else {
                  console.error("CardPeek has no card stack....");
                }

                props.hideCardPeek();
              }}
            >
              Done
            </Button>
            <Button
              variant={"contained"}
              onClick={() => {
                props.hideCardPeek();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div className="random">
          <FormGroup>
            <FormControlLabel
              style={{
                color: "white",
                borderColor: "white",
              }}
              control={
                <Checkbox
                  checked={randomTop}
                  disabled={actionValues.every((a) => a !== "top")}
                  size="small"
                  style={{
                    color: actionValues.every((a) => a !== "top")
                      ? "darkgray"
                      : "white",
                    borderColor: "white",
                  }}
                  onChange={(c) => {
                    setRandomTop(c.target.checked);
                  }}
                />
              }
              label="Random on Top?"
            />
            <FormControlLabel
              style={{
                color: "white",
                borderColor: "white",
                fontSize: ".5rem",
              }}
              control={
                <Checkbox
                  checked={randomBottom}
                  disabled={actionValues.every((a) => a !== "bottom")}
                  size="small"
                  style={{
                    color: actionValues.every((a) => a !== "bottom")
                      ? "darkgray"
                      : "white",
                    borderColor: "white",
                  }}
                  onChange={(c) => {
                    setRandomBottom(c.target.checked);
                  }}
                />
              }
              label="Random on Bottom?"
            />
          </FormGroup>
        </div>
        <div className="peek-content">
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <DragDropContext
              onDragEnd={(result) => {
                // dropped outside the list
                if (!result.destination) {
                  return;
                }

                const newActionValues = reorder(
                  actionValues,
                  result.source.index,
                  result.destination.index
                );

                const newerIndeces = reorder(
                  newIndeces,
                  result.source.index,
                  result.destination.index
                );

                setActionValues(newActionValues);
                setNewIndeces(newerIndeces);
              }}
            >
              <Droppable droppableId="droppable0" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(
                      snapshot.isDraggingOver,
                      reorderedCardImgs.length
                    )}
                    {...provided.droppableProps}
                  >
                    {reorderedCardImgs.map((pCardImageInfo, index) => {
                      const currentActionValue = actionValues[index];

                      const cardType = getCardTypeWithoutStack(
                        pCardImageInfo.jsonId,
                        true,
                        props.cardsDataEntities
                      );

                      let shouldRotate = shouldRenderImageHorizontal(
                        pCardImageInfo.jsonId,
                        cardType,
                        GameManager.horizontalCardTypes[
                          props.currentGameType ??
                            GameManager.allRegisteredGameTypes[0]
                        ],
                        pCardImageInfo.imgUrl.includes("back")
                      );

                      if (
                        !!props.currentGameType &&
                        GameManager.getModuleForType(props.currentGameType)
                          .shouldRotateCard
                      ) {
                        shouldRotate = GameManager.getModuleForType(
                          props.currentGameType
                        ).shouldRotateCard!(
                          pCardImageInfo.jsonId,
                          cardType,
                          true
                        );
                      }

                      return (
                        <Draggable
                          key={`${pCardImageInfo.jsonId}-${index}`}
                          draggableId={`${pCardImageInfo.jsonId}-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <FormControl className="select">
                                <Select
                                  id="game-picker"
                                  labelId="game-picker-label"
                                  onChange={(ai) => {
                                    actionValues[index] = ai.target.value;
                                    setActionValues([...actionValues]);
                                  }}
                                  variant={"standard"}
                                  value={currentActionValue}
                                  className={
                                    snapshot.isDragging
                                      ? `dragging`
                                      : `not-dragging`
                                  }
                                >
                                  <MenuItem key={`menu-item-top`} value={"top"}>
                                    Top of Deck
                                  </MenuItem>
                                  <MenuItem
                                    key={`menu-item-bottom`}
                                    value={"bottom"}
                                  >
                                    Bottom of Deck
                                  </MenuItem>
                                  <MenuItem
                                    key={`menu-item-draw`}
                                    value={"draw"}
                                  >
                                    Draw
                                  </MenuItem>
                                  <MenuItem
                                    key={`menu-item-reveal`}
                                    value={"reveal"}
                                  >
                                    Reveal
                                  </MenuItem>
                                </Select>
                              </FormControl>
                              <img
                                {...provided.dragHandleProps}
                                className={cx({
                                  "peek-img": true,
                                  "rotate-card": shouldRotate,
                                })}
                                src={pCardImageInfo.imgUrl}
                              ></img>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </TopLayer>
  );
};

export default CardPeek;
