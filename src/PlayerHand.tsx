import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { IconButton } from "@mui/material";
import cx from "classnames";
import { Vector2d } from "konva/lib/types";
import React, { Component, useCallback, useEffect } from "react";
import {
  BeforeCapture,
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  DragStart,
  Droppable,
  DropResult,
  NotDraggingStyle,
  ResponderProvided,
} from "@hello-pangea/dnd";
import AllPlayerHand from "./AllPlayerHand";
import {
  myPeerRef,
  playerHandElementId,
  playerHandHeightPx,
} from "./constants/app-constants";
import { CardSizeType } from "./constants/card-constants";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { ICardData } from "./features/cards-data/initialState";
import {
  ICardDetails,
  ICardStack,
  IPlayerHand,
  IPlayerHandCard,
} from "./features/cards/initialState";
import GameManager from "./game-modules/GameModuleManager";
import { GameType } from "./game-modules/GameType";
import "./PlayerHand.scss";
import TopLayer from "./TopLayer";
import {
  is_safari_or_uiwebview,
  is_touch_supported,
} from "./utilities/browser-utils";
import {
  getCardTypeWithoutStack,
  getImgUrls,
  shouldRenderImageHorizontal,
} from "./utilities/card-utils";

const grid = 8;

const getItemStyle = (
  snapshot: DraggableStateSnapshot,
  draggableStyle: any,
  selected: boolean,
  selectedColor: string
): DraggingStyle | NotDraggingStyle | undefined => {
  const outline = selected ? `2px solid ${selectedColor}` : "";
  return snapshot.dropAnimation &&
    snapshot.draggingOver === "droppable-while-dragging"
    ? { ...draggableStyle, outline, visibility: "hidden" }
    : {
        outline,
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        margin: `10px ${grid}px 0 0`,
        // zIndex: 101,
        // change background colour if dragging
        // background: snapshot.isDragging ? "lightgreen" : "grey",

        // styles we need to apply on draggables
        ...draggableStyle,
      };
};

const getListStyle = (isDraggingOver: boolean) =>
  ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    display: "flex",
    padding: grid,
    overflowX: "auto",
    overflowY: "hidden",
    position: "absolute",
    bottom: "0px",
    width: "100vw",
    height: `${playerHandHeightPx}px`,
    boxSizing: "border-box",
  } as React.CSSProperties);

const getListStyle2 = (isDraggingOver: boolean, isDraggingAtAll: boolean) => {
  return {
    background: "rgb(0,0,0,0)",
    display: isDraggingAtAll ? "flex" : "none",
    padding: grid,
    overflow: "auto",
    position: "absolute",
    top: "0px",
    height: "",
    width: "100vw",
    boxSizing: "border-box",
    // zIndex: 100,
  } as React.CSSProperties;
};

const makeFakeCardStackFromJsonId = (
  jsonId: string,
  faceup?: boolean
): ICardStack => {
  return {
    controlledBy: myPeerRef,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: faceup === undefined || !!faceup,
    topCardFaceup: false,
    fill: "anything",
    id: "fake-id",
    selected: false,
    x: 0,
    y: 0,
    cardStack: [{ jsonId }],
    statusTokens: {
      stunned: 0,
      confused: 0,
      tough: 0,
    },
    counterTokensList: [],
    modifiers: {},
    extraIcons: [],
    sizeType: CardSizeType.Standard,
  };
};

interface IProps {
  droppedOnTable: (ids: string[], faceup: boolean, pos?: Vector2d) => void;
  droppedBackInHand: () => void;
  reorderPlayerHand: (payload: {
    playerNumber: number;
    sourceIndeces: number[];
    destinationIndex: number;
  }) => void;
  removeFromPlayerHand: (payload: {
    playerNumber: number;
    indeces: number[];
  }) => void;
  flipInPlayerHand: (payload: {
    playerNumber: number;
    indeces: number[];
  }) => void;
  setPreviewCardJsonId: (payload: { id: string; modal?: boolean }) => void;
  clearPreviewCardJsonId: () => void;
  startDraggingCardFromHand: () => void;
  stopDraggingCardFromHand: () => void;
  allPlayerHandsData: { numCards: number; role: string | null }[];
  playerHandData: IPlayerHand | null;
  cardData: ICardData;
  playerNumber: number;
  playerColor: string;
  currentGameType: GameType | null;
  dragging: boolean;
  setVisiblePlayerHandNumber: (num: number) => void;
  setPlayerRole: (payload: {
    playerNumber: number;
    role: string | null;
  }) => void;
  clearPlayerRole: (payload: { playerNumber: number }) => void;
  showFullHandUI: boolean;
  toggleShowFullHandUI: () => void;
}
interface IState {
  modal: boolean;
  imgUrlToStatusMap: { [key: string]: ImageLoadingStatus };
  showMenu: boolean;
  anchorEl: HTMLElement | undefined;
  selectedCardIndeces: number[];
  draggingIndex: number | null;
}

enum ImageLoadingStatus {
  NotLoaded,
  Loading,
  LoadingFailed,
  Loaded,
}

let tapped: NodeJS.Timeout | null = null;
let dragStartTime: number = 0;
let topLevelDivRef: HTMLDivElement | null = null;
let selectedIndecesBeforeDrag: number[] = [];
let preventClear: boolean = false;

const PlayerHand = (props: IProps) => {
  const [modal, setModal] = React.useState(false);
  const [imgUrlToStatusMap, setImgUrlToStatusMap] = React.useState<{
    [key: string]: ImageLoadingStatus;
  }>({});
  const [showMenu, setShowMenu] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | undefined>();
  const [selectedCardIndeces, setSelectedCardIndeces] = React.useState<
    number[]
  >([]);
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

  const clearSelectedCardsFromClick = useCallback(
    (event: MouseEvent) => {
      if (
        !event.defaultPrevented &&
        selectedCardIndeces.length > 0 &&
        !preventClear
      ) {
        setSelectedCardIndeces([]);
      }

      if (preventClear) {
        preventClear = false;
      }
    },
    [selectedCardIndeces, preventClear]
  );

  const clearSelectedCardsFromTouch = useCallback((event: TouchEvent) => {
    if (!event.defaultPrevented && event.target instanceof HTMLCanvasElement) {
      setSelectedCardIndeces([]);
    }
  }, []);

  const singleClickLogic = useCallback(
    (
      event: React.MouseEvent | null,
      index: number,
      forceSelected: boolean = false
    ) => {
      // if we are selected, remove from selection
      if (selectedCardIndeces.includes(index)) {
        // only remove it if we are not forcing it to stay selected
        if (!forceSelected) {
          const newSelInd = selectedCardIndeces.filter((i) => i !== index);
          setSelectedCardIndeces(newSelInd);
        }
      } else {
        // add it
        setSelectedCardIndeces(selectedCardIndeces.concat([index]));
      }

      event?.preventDefault();
    },
    [selectedCardIndeces, setSelectedCardIndeces]
  );

  const handleTapInClick = useCallback(
    (
      card: ICardDetails | null,
      index: number,
      event: React.MouseEvent | null,
      result: DropResult | null,
      forceSelected: boolean = false
    ) => {
      if (!tapped) {
        //if tap is not set, set up single tap
        tapped = setTimeout(() => {
          tapped = null;

          singleClickLogic(event, index, forceSelected);
        }, 200); //wait 200ms then run single click code
      } else {
        let jsonId = "";
        if (!card) {
          const cards = props.playerHandData?.cards ?? [];
          if (cards.length > 0 && !!result) {
            jsonId = cards[result.source.index].cardDetails.jsonId;
          }
        } else {
          jsonId = card.jsonId;
        }
        //tapped within 200ms of last tap. double tap
        clearTimeout(tapped); //stop single tap callback
        tapped = null;
        // this.setState({ modal: true });
        props.setPreviewCardJsonId({ id: jsonId, modal: true });
      }
    },
    [singleClickLogic, props.setPreviewCardJsonId, props.playerHandData]
  );

  //onDragEnd
  const onDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const now = new Date().getTime();
      const dragTimeDelta = now - dragStartTime;
      dragStartTime = 0;

      let removePayload;

      // Next thing, make sure dragging is cleared out
      setDraggingIndex(null);

      // if the drag was less than 75 ms, treat that like a "click"
      if (dragTimeDelta < 75) {
        props.stopDraggingCardFromHand();

        // If the card wasn't selected before the drag started, it should be selected after. But
        // dragging itself "selects" the card, so if we don't force it to be selected it will
        // always deselect
        const forceSelected = !selectedIndecesBeforeDrag.includes(
          result.source.index
        );

        handleTapInClick(
          null,
          result.source.index,
          null,
          result,
          forceSelected
        );
        selectedIndecesBeforeDrag = [];
        return;
      }

      selectedIndecesBeforeDrag = [];

      // dropped outside the list
      if (!result.destination) {
        // make sure dragging is cleared out
        setSelectedCardIndeces([]);
        props.stopDraggingCardFromHand();
        return;
      }

      if (result.destination?.droppableId !== result.source.droppableId) {
        if (selectedCardIndeces.length > 1) {
          removePayload = {
            playerNumber: props.playerNumber,
            indeces: selectedCardIndeces,
          };
        } else {
          removePayload = {
            playerNumber: props.playerNumber,
            indeces: [result.source.index],
          };
        }
        const playerHandData = props.playerHandData?.cards ?? [];
        if (result.source.index >= playerHandData.length) {
          throw new Error("Index out of bounds in player hand drop logic");
        }
        const cardDroppedJson = playerHandData[result.source.index];
        props.droppedOnTable(
          selectedCardIndeces.length > 0
            ? selectedCardIndeces.map(
                (i) => playerHandData[i].cardDetails.jsonId
              )
            : [cardDroppedJson.cardDetails.jsonId],
          cardDroppedJson.faceup
        );
      } else {
        let sourceIndeces = [result.source.index];
        if (selectedCardIndeces.length > 0) {
          sourceIndeces = selectedCardIndeces;
        }
        props.reorderPlayerHand({
          playerNumber: props.playerNumber,
          sourceIndeces: sourceIndeces,
          destinationIndex: result.destination.index,
        });
        props.droppedBackInHand();
      }

      props.stopDraggingCardFromHand();

      // last thing, make sure dragging is cleared out
      setSelectedCardIndeces([]);

      if (!!removePayload) {
        props.removeFromPlayerHand(removePayload);
      }
    },
    [
      props.playerNumber,
      props.reorderPlayerHand,
      props.droppedOnTable,
      props.droppedBackInHand,
      props.removeFromPlayerHand,
      props.stopDraggingCardFromHand,
      handleTapInClick,
      selectedCardIndeces,
    ]
  );

  const onDragStart = useCallback(
    (dragStart: DragStart) => {
      const newState = {
        draggingIndex: dragStart.source.index,
      } as IState;

      if (!selectedCardIndeces.includes(dragStart.source.index)) {
        newState.selectedCardIndeces = selectedCardIndeces.concat([
          dragStart.source.index,
        ]);
      }

      selectedIndecesBeforeDrag = selectedCardIndeces;
      setDraggingIndex(dragStart.source.index);
      if (newState.selectedCardIndeces) {
        setSelectedCardIndeces(newState.selectedCardIndeces);
      }
      dragStartTime = new Date().getTime();
    },
    [selectedCardIndeces, setSelectedCardIndeces, setDraggingIndex]
  );

  const onBeforeCapture = useCallback(
    (beforeCapture: BeforeCapture) => {
      props.startDraggingCardFromHand();
    },
    [props.startDraggingCardFromHand]
  );

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.code === "KeyF") {
        props.flipInPlayerHand({
          playerNumber: props.playerNumber,
          indeces: selectedCardIndeces,
        });
      }
    },
    [props.flipInPlayerHand, props.playerNumber, selectedCardIndeces]
  );

  const renderTopLayer = useCallback(() => {
    return modal ? (
      <TopLayer
        position={{ x: 0, y: 0 }}
        completed={() => {
          props.clearPreviewCardJsonId();
          setModal(false);
        }}
      ></TopLayer>
    ) : null;
  }, [props.clearPreviewCardJsonId, modal, setModal]);

  const handleSelectAll = useCallback((): void => {
    const cards = props.playerHandData?.cards ?? [];
    if (cards.length > 0) {
      const indeces = Array.from({ length: cards.length }, (_, i) => i);
      setSelectedCardIndeces(indeces);
    }
  }, [props.playerHandData, setSelectedCardIndeces]);

  const handleClick = useCallback(
    (card: ICardDetails, index: number) => (event: React.MouseEvent) => {
      if (topLevelDivRef) {
        topLevelDivRef.focus();
      }
      if (
        (event.nativeEvent as PointerEvent).pointerType === "touch" ||
        is_safari_or_uiwebview ||
        is_touch_supported
      ) {
        handleTapInClick(card, index, event, null);
        event.preventDefault();
        event.stopPropagation();
      } else {
        singleClickLogic(event, index);
      }
    },
    [topLevelDivRef, handleTapInClick, singleClickLogic]
  );

  /////////////////////////////////
  // CARD RENDER LOGIC STARTS HERE
  /////////////////////////////////

  const renderCardContents = useCallback(
    (
      card: IPlayerHandCard,
      numDragging: number,
      imgUrlToStatusMap: { [key: string]: ImageLoadingStatus }
    ) => {
      const imgs = getImgUrls(
        makeFakeCardStackFromJsonId(card.cardDetails.jsonId, card.faceup),
        props.cardData,
        props.currentGameType ??
          (GameManager.allRegisteredGameTypes[0] as GameType)
      );

      // Only want to show the first image if multiple are loaded
      const imgsWithData = imgs.map((i) => ({
        url: i,
        status: imgUrlToStatusMap[i],
      }));
      const loadedImgs = imgsWithData.filter(
        (iData) => iData.status === ImageLoadingStatus.Loaded
      );
      const firstLoadedImage = loadedImgs.length > 0 ? loadedImgs[0].url : null;
      return imgs.map((i, index) => {
        const cardType = getCardTypeWithoutStack(
          card.cardDetails.jsonId,
          card.faceup,
          props.cardData
        );

        let shouldRotate = shouldRenderImageHorizontal(
          card.cardDetails.jsonId,
          cardType,
          GameManager.horizontalCardTypes[
            props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
          ],
          i.includes("back")
        );

        if (
          !!props.currentGameType &&
          GameManager.getModuleForType(props.currentGameType).shouldRotateCard
        ) {
          shouldRotate = GameManager.getModuleForType(props.currentGameType)
            .shouldRotateCard!(card.cardDetails.jsonId, cardType, card.faceup);
        }

        return (
          <div key={`card-${card.cardDetails.jsonId}-img-${index}`}>
            {numDragging > 1 ? (
              <div className="num-dragging">{numDragging}</div>
            ) : null}
            <img
              className={cx({
                "hide-img": i !== firstLoadedImage,
                "show-img": i === firstLoadedImage,
                "rotate-card": shouldRotate,
              })}
              onLoad={(e) => {
                setImgUrlToStatusMap((prevValue) => ({
                  ...prevValue,
                  [i]: ImageLoadingStatus.Loaded,
                }));
              }}
              onError={(e) => {
                setImgUrlToStatusMap((prevValue) => ({
                  ...prevValue,
                  [i]: ImageLoadingStatus.LoadingFailed,
                }));
              }}
              alt="card"
              src={i}
            ></img>
          </div>
        );
      });
    },
    [
      props.cardData,
      props.currentGameType,
      setImgUrlToStatusMap,
      imgUrlToStatusMap,
    ]
  );

  const renderDroppableIfDragging = useCallback(() => {
    return true ? (
      <Droppable droppableId="droppable-while-dragging" direction="horizontal">
        {(provided, snapshot) => (
          <div
            className="card-dropzone"
            ref={provided.innerRef}
            style={getListStyle2(snapshot.isDraggingOver, props.dragging)}
            {...provided.droppableProps}
          >
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ) : null;
  }, [props.dragging]);

  /////////////////////////////////
  // MOUNT / UNMOUNT LOGIC
  /////////////////////////////////

  // Mount / unmount logic
  useEffect(() => {
    window.addEventListener("click", clearSelectedCardsFromClick);
    window.addEventListener("touchend", clearSelectedCardsFromTouch);

    return () => {
      window.removeEventListener("click", clearSelectedCardsFromClick);
      window.removeEventListener("touchend", clearSelectedCardsFromTouch);
    };
  }, [clearSelectedCardsFromClick, clearSelectedCardsFromTouch]);

  /////////////////////////////////
  // MAIN RENDER LOGIC STARTS HERE
  /////////////////////////////////

  const cards = props.playerHandData?.cards ?? [];
  const possibleRoles = GameManager.getModuleForType(
    props.currentGameType ?? (GameManager.allRegisteredGameTypes[0] as GameType)
  ).properties.roles;
  return (
    <div
      ref={(val) => {
        topLevelDivRef = val;
      }}
      tabIndex={0}
      onKeyUp={handleKeyUp}
    >
      {renderTopLayer()}
      {props.showFullHandUI && <AllPlayerHand {...props}></AllPlayerHand>}
      {showMenu && (
        <ContextMenu
          anchorEl={anchorEl}
          items={(!!possibleRoles
            ? ([
                {
                  label: "Select Role",
                  children: possibleRoles.roles.map((r) => ({
                    label: `${r.name} ${
                      r.name === props.playerHandData?.role
                        ? "(Current Role)"
                        : ""
                    }`,
                    action: () => {
                      preventClear = true;
                      props.setPlayerRole({
                        playerNumber: props.playerNumber,
                        role: r.name,
                      });
                    },
                  })),
                },
                {
                  label: "Clear Role",
                  action: () => {
                    preventClear = true;
                    props.clearPlayerRole({
                      playerNumber: props.playerNumber,
                    });
                  },
                },
              ] as ContextMenuItem[])
            : ([] as ContextMenuItem[])
          ).concat([
            {
              label: "Show player hand",
              children: props.allPlayerHandsData.map((handData, i) => ({
                label: `Player ${i + 1}${
                  handData.role ? " - " + handData.role : ""
                } (${handData.numCards})`,
                action: () => {
                  preventClear = true;
                  props.setVisiblePlayerHandNumber(i + 1);
                },
              })),
            },
            {
              label: "Drop random card",
              action: (wasTouch: boolean | undefined) => {
                if (cards.length > 0) {
                  const randIndex = Math.floor(Math.random() * cards.length);
                  const handCard = cards[randIndex];
                  props.removeFromPlayerHand({
                    playerNumber: props.playerNumber,
                    indeces: [randIndex],
                  });

                  const dropPos = wasTouch ? { x: 100, y: 100 } : undefined;

                  props.droppedOnTable(
                    [handCard.cardDetails.jsonId],
                    handCard.faceup,
                    dropPos
                  );
                }
              },
            },
            {
              label: "Flip cards",
              action: () => {
                preventClear = true;
                if (selectedCardIndeces.length > 0) {
                  props.flipInPlayerHand({
                    playerNumber: props.playerNumber,
                    indeces: selectedCardIndeces,
                  });
                }
              },
            },
            {
              label: "Select all cards",
              action: () => {
                preventClear = true;
                handleSelectAll();
              },
            },
            {
              label: "View Entire Hand",
              action: () => {
                preventClear = true;
                props.toggleShowFullHandUI();
              },
            },
          ])}
          hideContextMenu={() => {
            setAnchorEl(undefined);
            setShowMenu(false);
          }}
        ></ContextMenu>
      )}
      <DragDropContext
        onDragEnd={onDragEnd}
        onBeforeCapture={onBeforeCapture}
        onDragStart={onDragStart}
      >
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              id={playerHandElementId}
              onClick={props.clearPreviewCardJsonId}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              <IconButton
                onClick={(event) => {
                  // we don't want this to make it to the window
                  // level handler that deselects the cards
                  event.stopPropagation();
                  setAnchorEl(event.nativeEvent.target as HTMLElement);
                  setShowMenu(true);
                }}
                className="options-menu-button"
              >
                <MoreHorizIcon fontSize="large" />
              </IconButton>
              <div className="player-number">P{props.playerNumber}</div>
              {props.playerHandData?.role && (
                <div className="role">{props.playerHandData.role}</div>
              )}
              {cards.map((card, index) => (
                <Draggable
                  key={`player-hand-${props.playerNumber}-${index}`}
                  draggableId={`player-hand-${props.playerNumber}-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") {
                          props.setPreviewCardJsonId({
                            id: card.cardDetails.jsonId,
                          });
                        }
                      }}
                      onPointerLeave={props.clearPreviewCardJsonId}
                      onClick={handleClick(card.cardDetails, index)}
                      className={cx({
                        "player-hand-card": true,
                        selected: selectedCardIndeces.includes(index),
                        "multi-dragging":
                          draggingIndex !== null &&
                          selectedCardIndeces.includes(index) &&
                          draggingIndex !== index,
                      })}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot,
                        provided.draggableProps.style,
                        selectedCardIndeces.includes(index),
                        props.playerColor
                      )}
                    >
                      {renderCardContents(
                        card,
                        draggingIndex === index
                          ? selectedCardIndeces.length
                          : 0,
                        imgUrlToStatusMap
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {renderDroppableIfDragging()}
      </DragDropContext>
    </div>
  );
};

export default PlayerHand;
