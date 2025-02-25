import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { IconButton } from "@mui/material";
import cx from "classnames";
import { Vector2d } from "konva/lib/types";
import React, { Component } from "react";
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

class PlayerHand extends Component<IProps, IState> {
  // static whyDidYouRender = false;
  // static whyDidYouRender = {
  //   logOnDifferentValues: true,
  //   customName: "PlayerHand",
  // };
  private tapped: NodeJS.Timeout | null = null;
  private dragStartTime: number = 0;
  private topLevelDivRef: HTMLDivElement | null = null;
  private selectedIndecesBeforeDrag: number[] = [];
  private preventClear: boolean = false;

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
    if (
      !event.defaultPrevented &&
      this.state.selectedCardIndeces.length > 0 &&
      !this.preventClear
    ) {
      this.setState({
        selectedCardIndeces: [],
      });
    }

    if (this.preventClear) {
      this.preventClear = false;
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
    const newState = {
      draggingIndex: dragStart.source.index,
    } as IState;

    if (!this.state.selectedCardIndeces.includes(dragStart.source.index)) {
      newState.selectedCardIndeces = this.state.selectedCardIndeces.concat([
        dragStart.source.index,
      ]);
    }

    this.selectedIndecesBeforeDrag = this.state.selectedCardIndeces;
    this.setState(newState);
    this.dragStartTime = new Date().getTime();
  }

  onBeforeCapture(beforeCapture: BeforeCapture) {
    this.props.startDraggingCardFromHand();
  }

  onDragEnd(result: DropResult, provided: ResponderProvided) {
    const now = new Date().getTime();
    const dragTimeDelta = now - this.dragStartTime;
    this.dragStartTime = 0;

    let removePayload;

    // Next thing, make sure dragging is cleared out
    this.setState({
      draggingIndex: null,
    });

    // if the drag was less than 75 ms, treat that like a "click"
    if (dragTimeDelta < 75) {
      this.props.stopDraggingCardFromHand();

      // If the card wasn't selected before the drag started, it should be selected after. But
      // dragging itself "selects" the card, so if we don't force it to be selected it will
      // always deselect
      const forceSelected = !this.selectedIndecesBeforeDrag.includes(
        result.source.index
      );

      this.handleTapInClick(
        null,
        result.source.index,
        null,
        result,
        forceSelected
      );
      this.selectedIndecesBeforeDrag = [];
      return;
    }

    this.selectedIndecesBeforeDrag = [];

    // dropped outside the list
    if (!result.destination) {
      // make sure dragging is cleared out
      this.setState({
        selectedCardIndeces: [],
      });
      this.props.stopDraggingCardFromHand();
      return;
    }

    if (result.destination?.droppableId !== result.source.droppableId) {
      if (this.state.selectedCardIndeces.length > 1) {
        removePayload = {
          playerNumber: this.props.playerNumber,
          indeces: this.state.selectedCardIndeces,
        };
      } else {
        removePayload = {
          playerNumber: this.props.playerNumber,
          indeces: [result.source.index],
        };
      }
      const playerHandData = this.props.playerHandData?.cards ?? [];
      if (result.source.index >= playerHandData.length) {
        throw new Error("Index out of bounds in player hand drop logic");
      }
      const cardDroppedJson = playerHandData[result.source.index];
      this.props.droppedOnTable(
        this.state.selectedCardIndeces.length > 0
          ? this.state.selectedCardIndeces.map(
              (i) => playerHandData[i].cardDetails.jsonId
            )
          : [cardDroppedJson.cardDetails.jsonId],
        cardDroppedJson.faceup
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

    // last thing, make sure dragging is cleared out
    this.setState({
      selectedCardIndeces: [],
    });

    if (!!removePayload) {
      this.props.removeFromPlayerHand(removePayload);
    }
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
    console.log(
      "***RENDER. cards: ",
      cards.map((c) => c.cardDetails.jsonId)
    );
    console.log("***RENDER. imgStatus: ", this.state.imgUrlToStatusMap);
    const possibleRoles = GameManager.getModuleForType(
      this.props.currentGameType ??
        (GameManager.allRegisteredGameTypes[0] as GameType)
    ).properties.roles;
    return (
      <div
        ref={(val) => {
          this.topLevelDivRef = val;
        }}
        tabIndex={0}
        onKeyUp={this.handleKeyUp}
      >
        {this.renderTopLayer()}
        {this.props.showFullHandUI && (
          <AllPlayerHand {...this.props}></AllPlayerHand>
        )}
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
                        this.preventClear = true;
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
                      this.preventClear = true;
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
                children: this.props.allPlayerHandsData.map((handData, i) => ({
                  label: `Player ${i + 1}${
                    handData.role ? " - " + handData.role : ""
                  } (${handData.numCards})`,
                  action: () => {
                    this.preventClear = true;
                    this.props.setVisiblePlayerHandNumber(i + 1);
                  },
                })),
              },
              {
                label: "Drop random card",
                action: (wasTouch: boolean | undefined) => {
                  if (cards.length > 0) {
                    const randIndex = Math.floor(Math.random() * cards.length);
                    const handCard = cards[randIndex];
                    this.props.removeFromPlayerHand({
                      playerNumber: this.props.playerNumber,
                      indeces: [randIndex],
                    });

                    const dropPos = wasTouch ? { x: 100, y: 100 } : undefined;

                    this.props.droppedOnTable(
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
                  this.preventClear = true;
                  if (this.state.selectedCardIndeces.length > 0) {
                    this.props.flipInPlayerHand({
                      playerNumber: this.props.playerNumber,
                      indeces: this.state.selectedCardIndeces,
                    });
                  }
                },
              },
              {
                label: "Select all cards",
                action: () => {
                  this.preventClear = true;
                  this.handleSelectAll();
                },
              },
              {
                label: "View Entire Hand",
                action: () => {
                  this.preventClear = true;
                  this.props.toggleShowFullHandUI();
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
                    // we don't want this to make it to the window
                    // level handler that deselects the cards
                    event.stopPropagation();
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
                            this.props.setPreviewCardJsonId({
                              id: card.cardDetails.jsonId,
                            });
                          }
                        }}
                        onPointerLeave={this.props.clearPreviewCardJsonId}
                        onClick={this.handleClick(card.cardDetails, index)}
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
                            : 0,
                          this.state.imgUrlToStatusMap
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

  singleClickLogic = (
    event: React.MouseEvent | null,
    index: number,
    forceSelected: boolean = false
  ) => {
    // if we are selected, remove from selection
    if (this.state.selectedCardIndeces.includes(index)) {
      // only remove it if we are not forcing it to stay selected
      if (!forceSelected) {
        const newSelInd = this.state.selectedCardIndeces.filter(
          (i) => i !== index
        );
        this.setState({
          selectedCardIndeces: newSelInd,
        });
      }
    } else {
      // add it
      console.log(this.state.selectedCardIndeces);
      this.setState({
        selectedCardIndeces: this.state.selectedCardIndeces.concat([index]),
      });
    }

    event?.preventDefault();
  };

  handleClick =
    (card: ICardDetails, index: number) => (event: React.MouseEvent) => {
      if (this.topLevelDivRef) {
        this.topLevelDivRef.focus();
      }
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
    result: DropResult | null,
    forceSelected: boolean = false
  ) => {
    if (!this.tapped) {
      //if tap is not set, set up single tap
      this.tapped = setTimeout(() => {
        this.tapped = null;

        this.singleClickLogic(event, index, forceSelected);
      }, 200); //wait 200ms then run single click code
    } else {
      let jsonId = "";
      if (!card) {
        const cards = this.props.playerHandData?.cards ?? [];
        if (cards.length > 0 && !!result) {
          jsonId = cards[result.source.index].cardDetails.jsonId;
        }
      } else {
        jsonId = card.jsonId;
      }
      //tapped within 200ms of last tap. double tap
      clearTimeout(this.tapped); //stop single tap callback
      this.tapped = null;
      // this.setState({ modal: true });
      this.props.setPreviewCardJsonId({ id: jsonId, modal: true });
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

  renderCardContents(
    card: IPlayerHandCard,
    numDragging: number,
    imgUrlToStatusMap: { [key: string]: ImageLoadingStatus }
  ) {
    console.log("RENDERING CARD CONTENTS for ", card.cardDetails.jsonId);
    const imgs = getImgUrls(
      makeFakeCardStackFromJsonId(card.cardDetails.jsonId, card.faceup),
      this.props.cardData,
      this.props.currentGameType ??
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

    console.log("FIRST LOADED IMAGE", firstLoadedImage);

    return imgs.map((i, index) => {
      const cardType = getCardTypeWithoutStack(
        card.cardDetails.jsonId,
        card.faceup,
        this.props.cardData
      );

      let shouldRotate = shouldRenderImageHorizontal(
        card.cardDetails.jsonId,
        cardType,
        GameManager.horizontalCardTypes[
          this.props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
        ],
        i.includes("back")
      );

      if (
        !!this.props.currentGameType &&
        GameManager.getModuleForType(this.props.currentGameType)
          .shouldRotateCard
      ) {
        shouldRotate = GameManager.getModuleForType(this.props.currentGameType)
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
              console.log("*LOADED image", i);
              this.setState({
                imgUrlToStatusMap: {
                  ...imgUrlToStatusMap,
                  [i]: ImageLoadingStatus.Loaded,
                },
              });
              console.log("* state now", this.state.imgUrlToStatusMap);
            }}
            onError={(e) => {
              this.setState({
                imgUrlToStatusMap: {
                  ...imgUrlToStatusMap,
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

  private handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.code === "KeyF") {
      this.props.flipInPlayerHand({
        playerNumber: this.props.playerNumber,
        indeces: this.state.selectedCardIndeces,
      });
    }
  };

  private handleSelectAll = (): void => {
    const cards = this.props.playerHandData?.cards ?? [];
    if (cards.length > 0) {
      const indeces = Array.from({ length: cards.length }, (_, i) => i);
      this.setState({ selectedCardIndeces: indeces });
    }
  };
}
export default PlayerHand;
