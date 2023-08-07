import { IconButton } from "@mui/material";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import cx from "classnames";
import { Vector2d } from "konva/lib/types";
import React, { Component } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle,
  ResponderProvided,
} from "react-beautiful-dnd";
import {
  myPeerRef,
  playerHandElementId,
  playerHandHeightPx,
} from "./constants/app-constants";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { ICardData } from "./features/cards-data/initialState";
import {
  ICardDetails,
  ICardStack,
  IPlayerHand,
  MAX_PLAYERS,
} from "./features/cards/initialState";
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
import { GameType } from "./game-modules/GameType";
import GameManager from "./game-modules/GameModuleManager";
import { CardSizeType } from "./constants/card-constants";
import { DragStart } from "react-beautiful-dnd";
import { BeforeCapture } from "react-beautiful-dnd";

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
        zIndex: 101,
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
    zIndex: 100,
  } as React.CSSProperties;
};

const makeFakeCardStackFromJsonId = (jsonId: string): ICardStack => {
  return {
    controlledBy: myPeerRef,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
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
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
      acceleration: 0,
    },
    modifiers: {},
    extraIcons: [],
    sizeType: CardSizeType.Standard,
  };
};

interface IProps {
  droppedOnTable: (ids: string[], pos?: Vector2d) => void;
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
  setPreviewCardJsonId: (jsonId: string) => void;
  clearPreviewCardJsonId: () => void;
  startDraggingCardFromHand: () => void;
  stopDraggingCardFromHand: () => void;
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

class PlayerHand extends Component<IProps, IState> {
  static whyDidYouRender = true;
  private tapped: NodeJS.Timeout | null = null;
  private dragStartTime: number = 0;

  constructor(props: IProps) {
    super(props);
    this.state = {
      modal: false,
      imgUrlToStatusMap: {},
      showMenu: false,
      anchorEl: undefined,
      selectedCardIndeces: [],
      draggingIndex: null,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onBeforeCapture = this.onBeforeCapture.bind(this);
    this.clearSelectedCardsFromClick =
      this.clearSelectedCardsFromClick.bind(this);
    this.clearSelectedCardsFromTouch =
      this.clearSelectedCardsFromTouch.bind(this);
  }

  clearSelectedCardsFromClick(event: MouseEvent) {
    if (!event.defaultPrevented && this.state.selectedCardIndeces.length > 0) {
      this.setState({
        selectedCardIndeces: [],
      });
    }
  }

  clearSelectedCardsFromTouch(event: TouchEvent) {
    if (!event.defaultPrevented && event.target instanceof HTMLCanvasElement) {
      this.setState({
        selectedCardIndeces: [],
      });
    }
  }

  onDragStart(dragStart: DragStart) {
    this.setState({
      draggingIndex: dragStart.source.index,
    });
    this.dragStartTime = new Date().getTime();
  }

  onBeforeCapture(beforeCapture: BeforeCapture) {
    this.props.startDraggingCardFromHand();
  }

  onDragEnd(result: DropResult, provided: ResponderProvided) {
    const now = new Date().getTime();
    const dragTimeDelta = now - this.dragStartTime;
    this.dragStartTime = 0;

    // Next thing, make sure dragging is cleared out
    this.setState({
      draggingIndex: null,
    });

    // if the drag was less that 75 ms, treat that like a "click"
    if (dragTimeDelta < 75) {
      this.props.stopDraggingCardFromHand();
      this.handleTapInClick(null, result.source.index, null, result);
      return;
    }

    // Next thing, make sure dragging is cleared out
    this.setState({
      selectedCardIndeces: [],
    });

    // dropped outside the list
    if (!result.destination) {
      this.props.stopDraggingCardFromHand();
      return;
    }

    if (result.destination?.droppableId !== result.source.droppableId) {
      if (this.state.selectedCardIndeces.length > 1) {
        this.props.removeFromPlayerHand({
          playerNumber: this.props.playerNumber,
          indeces: this.state.selectedCardIndeces,
        });
      } else {
        this.props.removeFromPlayerHand({
          playerNumber: this.props.playerNumber,
          indeces: [result.source.index],
        });
      }
      const playerHandData = this.props.playerHandData?.cards ?? [];
      if (result.source.index >= playerHandData.length) {
        throw new Error("Index out of bounds in player hand drop logic");
      }
      const cardDroppedJson = playerHandData[result.source.index];
      this.props.droppedOnTable(
        this.state.selectedCardIndeces.length > 0
          ? this.state.selectedCardIndeces.map((i) => playerHandData[i].jsonId)
          : [cardDroppedJson.jsonId]
      );
    } else {
      let sourceIndeces = [result.source.index];
      if (this.state.selectedCardIndeces.length > 0) {
        sourceIndeces = this.state.selectedCardIndeces;
      }
      this.props.reorderPlayerHand({
        playerNumber: this.props.playerNumber,
        sourceIndeces: sourceIndeces,
        destinationIndex: result.destination.index,
      });
      this.props.droppedBackInHand();
    }

    this.props.stopDraggingCardFromHand();
  }

  componentDidMount(): void {
    window.addEventListener("click", this.clearSelectedCardsFromClick);
    window.addEventListener("touchend", this.clearSelectedCardsFromTouch);
  }

  componentWillUnmount(): void {
    window.removeEventListener("click", this.clearSelectedCardsFromClick);
    window.removeEventListener("touchend", this.clearSelectedCardsFromTouch);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    const cards = this.props.playerHandData?.cards ?? [];
    const possibleRoles = GameManager.getModuleForType(
      this.props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
    ).properties.roles;
    return (
      <div>
        {this.renderTopLayer()}
        {this.state.showMenu && (
          <ContextMenu
            anchorEl={this.state.anchorEl}
            items={(!!possibleRoles
              ? ([
                  {
                    label: "Select Role",
                    children: possibleRoles.roles.map((r) => ({
                      label: `${r.name} ${
                        r.name === this.props.playerHandData?.role
                          ? "(Current Role)"
                          : ""
                      }`,
                      action: () => {
                        this.props.setPlayerRole({
                          playerNumber: this.props.playerNumber,
                          role: r.name,
                        });
                      },
                    })),
                  },
                  {
                    label: "Clear Role",
                    action: () => {
                      this.props.clearPlayerRole({
                        playerNumber: this.props.playerNumber,
                      });
                    },
                  },
                ] as ContextMenuItem[])
              : ([] as ContextMenuItem[])
            ).concat([
              {
                label: "Show player hand",
                children: Array.from({ length: MAX_PLAYERS }).map((_, i) => ({
                  label: `Player ${i + 1}`,
                  action: () => {
                    this.props.setVisiblePlayerHandNumber(i + 1);
                  },
                })),
              },
              {
                label: "Drop random card",
                action: (wasTouch: boolean | undefined) => {
                  if (cards.length > 0) {
                    const randIndex = Math.floor(Math.random() * cards.length);
                    const cardDetails = cards[randIndex];
                    this.props.removeFromPlayerHand({
                      playerNumber: this.props.playerNumber,
                      indeces: [randIndex],
                    });

                    const dropPos = wasTouch ? { x: 100, y: 100 } : undefined;

                    this.props.droppedOnTable([cardDetails.jsonId], dropPos);
                  }
                },
              },
            ])}
            hideContextMenu={() => {
              this.setState({ anchorEl: undefined, showMenu: false });
            }}
          ></ContextMenu>
        )}
        <DragDropContext
          onDragEnd={this.onDragEnd}
          onBeforeCapture={this.onBeforeCapture}
          onDragStart={this.onDragStart}
        >
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              <div
                id={playerHandElementId}
                onClick={this.props.clearPreviewCardJsonId}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                {...provided.droppableProps}
              >
                <IconButton
                  onClick={(event) => {
                    this.setState({
                      showMenu: true,
                      anchorEl: event.nativeEvent.target as HTMLElement,
                    });
                  }}
                  className="options-menu-button"
                >
                  <MoreHorizIcon fontSize="large" />
                </IconButton>
                <div className="player-number">P{this.props.playerNumber}</div>
                {this.props.playerHandData?.role && (
                  <div className="role">{this.props.playerHandData.role}</div>
                )}
                {cards.map((card, index) => (
                  <Draggable
                    key={`player-hand-${this.props.playerNumber}-${index}`}
                    draggableId={`player-hand-${this.props.playerNumber}-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        onPointerEnter={(event) => {
                          if (event.pointerType === "mouse") {
                            this.props.setPreviewCardJsonId(card.jsonId);
                          }
                        }}
                        onPointerLeave={this.props.clearPreviewCardJsonId}
                        onClick={this.handleClick(card, index)}
                        className={cx({
                          "player-hand-card": true,
                          selected:
                            this.state.selectedCardIndeces.includes(index),
                          "multi-dragging":
                            this.state.draggingIndex !== null &&
                            this.state.selectedCardIndeces.includes(index) &&
                            this.state.draggingIndex !== index,
                        })}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot,
                          provided.draggableProps.style,
                          this.state.selectedCardIndeces.includes(index),
                          this.props.playerColor
                        )}
                      >
                        {this.renderCardContents(
                          card,
                          this.state.draggingIndex === index
                            ? this.state.selectedCardIndeces.length
                            : 0
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {this.renderDroppableIfDragging()}
        </DragDropContext>
      </div>
    );
  }

  singleClickLogic = (event: React.MouseEvent | null, index: number) => {
    // if we are selected, remove from selection
    if (this.state.selectedCardIndeces.includes(index)) {
      this.setState({
        selectedCardIndeces: this.state.selectedCardIndeces.filter(
          (i) => i !== index
        ),
      });
    } else {
      // add it
      this.setState({
        selectedCardIndeces: this.state.selectedCardIndeces.concat([index]),
      });
    }

    event?.preventDefault();
  };

  handleClick =
    (card: ICardDetails, index: number) => (event: React.MouseEvent) => {
      if (
        (event.nativeEvent as PointerEvent).pointerType === "touch" ||
        is_safari_or_uiwebview ||
        is_touch_supported
      ) {
        this.handleTapInClick(card, index, event, null);
        event.preventDefault();
        event.stopPropagation();
      } else {
        this.singleClickLogic(event, index);
      }
    };

  handleTapInClick = (
    card: ICardDetails | null,
    index: number,
    event: React.MouseEvent | null,
    result: DropResult | null
  ) => {
    if (!this.tapped) {
      //if tap is not set, set up single tap
      this.tapped = setTimeout(() => {
        this.tapped = null;

        this.singleClickLogic(event, index);
      }, 200); //wait 200ms then run single click code
    } else {
      let jsonId = "";
      if (!card) {
        const cards = this.props.playerHandData?.cards ?? [];
        if (cards.length > 0 && !!result) {
          jsonId = cards[result.source.index].jsonId;
        }
      } else {
        jsonId = card.jsonId;
      }
      //tapped within 200ms of last tap. double tap
      clearTimeout(this.tapped); //stop single tap callback
      this.tapped = null;
      this.setState({ modal: true });
      this.props.setPreviewCardJsonId(jsonId);
    }
  };
  renderTopLayer() {
    return this.state.modal ? (
      <TopLayer
        position={{ x: 0, y: 0 }}
        completed={() => {
          this.props.clearPreviewCardJsonId();
          this.setState({
            modal: false,
          });
        }}
      ></TopLayer>
    ) : null;
  }

  renderCardContents(card: ICardDetails, numDragging: number) {
    const imgs = getImgUrls(
      makeFakeCardStackFromJsonId(card.jsonId),
      this.props.cardData,
      this.props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
    );

    // Only want to show the first image if multiple are loaded
    const imgsWithData = imgs.map((i) => ({
      url: i,
      status: this.state.imgUrlToStatusMap[i],
    }));
    const loadedImgs = imgsWithData.filter(
      (iData) => iData.status === ImageLoadingStatus.Loaded
    );
    const firstLoadedImage = loadedImgs.length > 0 ? loadedImgs[0].url : null;

    return imgs.map((i, index) => {
      const cardType = getCardTypeWithoutStack(
        card.jsonId,
        true /* cards in hand are always faceup */,
        this.props.cardData
      );
      const shouldRotate = shouldRenderImageHorizontal(
        card.jsonId,
        cardType,
        GameManager.horizontalCardTypes[
          this.props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
        ],
        false /* We're never showing card backs */
      );
      return (
        <div key={`card-${card.jsonId}-img-${index}`}>
          {numDragging > 1 ? (
            <div className="num-dragging">{numDragging}</div>
          ) : null}
          <img
            className={cx({
              "hide-img": i !== firstLoadedImage,
              "show-img": i === firstLoadedImage,
              "rotate-card": shouldRotate,
            })}
            onLoad={() => {
              this.setState({
                imgUrlToStatusMap: {
                  ...this.state.imgUrlToStatusMap,
                  [i]: ImageLoadingStatus.Loaded,
                },
              });
            }}
            onError={() => {
              this.setState({
                imgUrlToStatusMap: {
                  ...this.state.imgUrlToStatusMap,
                  [i]: ImageLoadingStatus.LoadingFailed,
                },
              });
            }}
            alt="card"
            src={i}
          ></img>
        </div>
      );
    });
  }

  renderDroppableIfDragging() {
    return true ? (
      <Droppable droppableId="droppable-while-dragging" direction="horizontal">
        {(provided, snapshot) => (
          <div
            className="card-dropzone"
            ref={provided.innerRef}
            style={getListStyle2(snapshot.isDraggingOver, this.props.dragging)}
            {...provided.droppableProps}
          >
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ) : null;
  }
}
export default PlayerHand;
