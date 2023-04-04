import { IconButton, Snackbar } from "@mui/material";
import * as Intersects from "intersects";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import React from "react";
import { Component } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import { Provider, ReactReduxContext } from "react-redux";
import Card from "./Card";
import CardStackCardSelectorContainer from "./CardStackCardSelectorContainer";
import CardtableAlertsContainer from "./CardtableAlertsContainer";
import {
  GameType,
  myPeerRef,
  PlayerColor,
  playerHandHeightPx,
  possibleColors,
  useWSLocalStorage,
} from "./constants/app-constants";
import {
  cardConstants,
  CounterTokenType,
  HORIZONTAL_TYPE_CODES,
  StatusTokenType,
} from "./constants/card-constants";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import ContextualOptionsMenuContainer from "./ContextualOptionsMenuContainer";
import Counter from "./Counter";
import CurvedArrowsContainer from "./CurvedArrowsContainer";
import DeckLoader from "./DeckLoader";
import EncounterLoaderContainer from "./EncounterLoaderContainer";
import { ICardData } from "./features/cards-data/initialState";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import { ICardsState, ICardStack } from "./features/cards/initialState";
import { ICounter } from "./features/counters/initialState";
import { IGameState } from "./features/game/initialState";
import FirstPlayerTokenContainer from "./FirstPlayerTokenContainer";
import "./Game.scss";
import NotesContainer from "./NotesContainer";
import OptionsMenuContainer from "./OptionsMenuContainer";
import PeerConnector from "./PeerConnector";
import PlayerHandContainer from "./PlayerHandContainer";
import SpecificCardLoaderContainer from "./SpecificCardLoaderContainer";
import TokenValueModifier from "./TokenValueModifier";
import TopLayer from "./TopLayer";
import {
  anyCardStackHasStatus,
  cacheImages,
  getCardType,
  getImgUrls,
  getImgUrlsFromJsonId,
  getMySelectedCards,
} from "./utilities/card-utils";
import { getCenter, getDistance } from "./utilities/geo";
import { copyToClipboard, generateRemoteGameUrl } from "./utilities/text-utils";
import CloseIcon from "@material-ui/icons/Close";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeckSearchContainer from "./DeckSearchContainer";
import log from "loglevel";
import NotificationsContainer from "./Notifications/NotificationsContainer";

const SCALE_BY = 1.02;

interface IProps {
  currentGameType: GameType;
  cards: ICardsState;
  cardsData: ICardData;
  gameState: IGameState;
  panMode: boolean;
  multiselectMode: boolean;
  playerColors: { [key: string]: PlayerColor };
  playerNumbers: { [key: string]: number };
  menuPreviewCard: ICardStack | null;
  isDoneLoadingJSONData: boolean;
  cardMove: (info: { id: string; dx: number; dy: number }) => void;
  endCardMove: (id: string) => void;
  cardFromHandMove: (pos: Vector2d) => void;
  exhaustCard: (id?: string) => void;
  deleteCardStack: (id?: string) => void;
  selectCard: (payload: { id: string; unselectOtherCards: boolean }) => void;
  unselectCard: (id: string) => void;
  toggleSelectCard: (id: string) => void;
  startCardMove: (payload: { id: string; splitTopCard: boolean }) => void;
  unselectAllCards: (payload?: any) => void;
  selectMultipleCards: (cards: {
    ids: string[];
    unselectOtherCards?: boolean;
  }) => void;
  setPreviewCardId: (id: string) => void;
  clearPreviewCard: () => void;
  togglePanMode: () => void;
  toggleDrawCardsIntoHand: () => void;
  toggleSnapCardsToGrid: () => void;
  toggleNotes: () => void;
  flipCards: () => void;
  loadCardsData: () => void;
  allJsonData: (payload: any) => void;
  shuffleStack: (id?: string) => void;
  fetchDecklistById: any;
  // fetchDecklistById: (payload: {
  //   gameType: GameType;
  //   decklistId: number;
  //   position: Vector2d;
  // }) => void;
  updateZoom: (zoom: Vector2d) => void;
  updatePosition: (pos: Vector2d) => void;
  resetApp: () => void;
  addCardStack: (payload: {
    cardJsonIds: string[];
    position: Vector2d;
  }) => void;
  addToExistingCardStack: (payload: {
    existingStackId: string;
    cardJsonIds: string[];
  }) => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
  }) => void;
  adjustStatusToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    delta: number;
  }) => void;
  adjustCounterToken: (payload: {
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }) => void;
  pullCardOutOfCardStack: (payload: {
    cardStackId: string;
    jsonId: string;
    pos: Vector2d;
  }) => void;
  addNewCounter: (pos: Vector2d) => void;
  updateCounterValue: (payload: { id: string; delta: number }) => void;
  removeCounter: (id: string) => void;
  moveCounter: (payload: { id: string; newPos: Vector2d }) => void;
  createNewMultiplayerGame: () => void;
  connectToRemoteGame: (peerId: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  counters: ICounter[];
  requestResync: () => void;
  peerId: string;
  multiplayerGameName: string;
  dropTargetCardsById: {
    [key: string]: { ownerRef: string; card: ICardStack | null };
  };
  drawCardsOutOfCardStack: (payload: DrawCardsOutOfCardStackPayload) => void;
  quitGame: () => void;
  updateCounterColor: (payload: { id: string; newColor: PlayerColor }) => void;
  createDeckFromTxt: (payload: {
    gameType: GameType;
    position: Vector2d;
    txtContents: string;
  }) => void;
  createDeckFromJson: (payload: {
    gameType: GameType;
    position: Vector2d;
    jsonContents: string;
  }) => void;
  generateGameStateUrl: () => void;
  saveDeckAsJson: (stack: ICardStack | undefined) => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
  showSpecificCardLoader: (payload: Vector2d) => void;
  showDeckSearch: (payload: Vector2d) => void;
  adjustModifier: (payload: {
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }) => void;
  clearAllModifiers: (payload: { id?: string }) => void;
  addToPlayerHand: (payload: { playerNumber: number }) => void;
  addExtraIcon: (icon: string) => void;
  removeExtraIcon: (icon: string) => void;
  clearMyGhostCards: () => void;
  setDrawingArrow: (val: boolean) => void;
  startNewArrow: (startCardId: string) => void;
  endDisconnectedArrow: (payload: { endCardId: string; myRef: string }) => void;
  updateDisconnectedArrowPosition: (payload: {
    endPos: Vector2d;
    myRef: string;
  }) => void;
  removeAnyDisconnectedArrows: (myRef: string) => void;
  removeAllArrows: () => void;
}

interface IState {
  showEmptyMessage: boolean;
  drewASelectionRect: boolean;
  selectRect: {
    height: number;
    width: number;
  };
  selectStartPos: {
    x: number;
    y: number;
  };
  selecting: boolean;
  showContextMenu: boolean;
  contextMenuPosition: Vector2d | null;
  contextMenuItems: ContextMenuItem[];
  showDeckImporter: boolean;
  deckImporterPosition: Vector2d | null;
  showEncounterImporter: boolean;
  encounterImporterPosition: Vector2d | null;
  showCardSearch: boolean;
  cardSearchTouchBased: boolean;
  cardSearchPosition: Vector2d | null;
  cardStackForSearching: ICardStack | null;
  showPeerConnector: boolean;
  peerConnectorPosition: Vector2d | null;
  showTokenValueModifier: boolean;
  tokenValueModifierProps: { id: string; tokenType: CounterTokenType } | null;
  tokenValueModifierPosition: Vector2d | null;
  playmatImage: HTMLImageElement | null;
  playmatImageLoaded: boolean;
  previewCardModal: boolean;
  stageWidth: number;
  stageHeight: number;
}
class Game extends Component<IProps, IState> {
  public isSetUp = false;

  public stage: Konva.Stage | null = null;

  private touchTimer: any = null;
  private doubleTapTimer: any = null;

  private lastCenter: Vector2d | null = null;
  private lastDist: number = 0;

  private lastMousePos: Vector2d = { x: 0, y: 0 };
  private captureLastMousePos = true;

  constructor(props: IProps) {
    super(props);

    if (!!Konva) {
      Konva.hitOnDragEnabled = true;
    }

    this.state = {
      showEmptyMessage: true,
      drewASelectionRect: false,
      selectRect: {
        height: 0,
        width: 0,
      },
      selectStartPos: {
        x: 0,
        y: 0,
      },
      selecting: false,
      showContextMenu: false,
      contextMenuPosition: null,
      contextMenuItems: [],
      showDeckImporter: false,
      deckImporterPosition: null,
      showEncounterImporter: false,
      encounterImporterPosition: null,
      showCardSearch: false,
      cardSearchTouchBased: false,
      cardSearchPosition: null,
      cardStackForSearching: null,
      showPeerConnector: false,
      peerConnectorPosition: null,
      showTokenValueModifier: false,
      tokenValueModifierProps: null,
      tokenValueModifierPosition: null,
      playmatImage: null,
      playmatImageLoaded: false,
      previewCardModal: false,
      stageWidth: window.innerWidth,
      stageHeight: window.innerHeight - playerHandHeightPx,
    };
  }

  public componentDidMount() {
    if (!this.isSetUp) {
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
      document.addEventListener("keypress", this.handleKeyPress);
      window.addEventListener("resize", this.handleResize);

      const image = new Image();
      image.onload = () => {
        this.setState({
          playmatImage: image,
          playmatImageLoaded: true,
        });
      };

      image.onerror = (e) => {
        log.error(e);
      };
      image.src =
        GamePropertiesMap[this.props.currentGameType].backgroundImageLocation;
      this.props.loadCardsData();
      this.props.allJsonData("");
      this.isSetUp = true;
    }
  }

  public componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keypress", this.handleKeyPress);
    window.removeEventListener("resize", this.handleResize);
  };

  public render() {
    // TODO: This feels like a bad hack. I bet all the
    //       swallowing of click events is keeping
    //       focus from behaving 'normally' and doing
    //       the expected thing with focus. But there are
    //       a lot of things that don't work quite right
    //       if the body has focus, so we're going to
    //       force the game area to have focus if it
    //       lost it
    // if (document.activeElement === document.body) {
    //   // setTimeout so we don't manually change the dom while rendering
    //   setTimeout(() => {
    //     const el = document.querySelector(".play-area") as HTMLElement;
    //     el?.focus();
    //   }, 0);
    // }
    // END HACK

    // if (!this.props.isDoneLoadingJSONData) {
    //   return <div>LOADING JSON DATA...</div>;
    // }

    const staticCards = this.props.cards.cards
      .filter((card) => !card.dragging)
      .map((card) => {
        return (
          <Card
            currentGameType={this.props.currentGameType}
            code={this.getCardCode(card)}
            name={this.getCardName(card)}
            selectedColor={
              this.props.playerColors[card.controlledBy] ?? "black"
            }
            controlledBy={card.controlledBy}
            key={card.id}
            id={card.id}
            x={card.x}
            y={card.y}
            exhausted={card.exhausted}
            disableDragging={this.props.gameState.drawingArrow}
            fill={card.fill}
            selected={card.selected}
            dropTargetColor={
              this.props.playerColors[
                this.props.dropTargetCardsById[card.id]?.ownerRef
              ] ?? ""
            }
            dragging={card.dragging}
            shuffling={card.shuffling}
            handleDragStart={this.handleCardDragStart}
            handleDragMove={this.props.cardMove}
            handleDoubleClick={this.handleSelectAndExhaust}
            handleDoubleTap={this.showOrToggleModalPreviewCard}
            handleClick={this.handleCardClick(card)}
            handleMouseDownWhenNotDraggable={this.handleStartArrow}
            handleMouseUpWhenNotDraggable={this.handleEndArrow}
            handleHover={this.props.setPreviewCardId}
            handleHoverLeave={this.props.clearPreviewCard}
            handleContextMenu={this.handleCardContextMenu}
            imgUrls={getImgUrls(
              card,
              this.props.cardsData,
              this.props.currentGameType
            )}
            typeCode={getCardType(card, this.props.cardsData)}
            faceup={card.faceup}
            numCardsInStack={card.cardStack.length}
            cardState={{
              stunned: card.statusTokens.stunned,
              confused: card.statusTokens.confused,
              tough: card.statusTokens.tough,
              tokens: { damage: 0, threat: 0, generic: 0 },
            }}
          />
        );
      });

    const ghostCards = this.props.cards.ghostCards.map((card) => {
      return (
        <Card
          currentGameType={this.props.currentGameType}
          name={this.getCardName(card)}
          code={this.getCardCode(card)}
          selectedColor={this.props.playerColors[card.controlledBy] ?? "black"}
          controlledBy={card.controlledBy}
          key={`ghost${card.id}`}
          id={card.id}
          x={card.x}
          y={card.y}
          exhausted={card.exhausted}
          fill={card.fill}
          selected={false}
          dragging={false}
          shuffling={false}
          imgUrls={getImgUrls(
            card,
            this.props.cardsData,
            this.props.currentGameType
          )}
          typeCode={getCardType(card, this.props.cardsData)}
          faceup={card.faceup}
          isGhost={true}
        />
      );
    });

    const movingCards = this.props.cards.cards
      .filter((card) => card.dragging)
      .map((card) => {
        return (
          <Card
            currentGameType={this.props.currentGameType}
            name={this.getCardName(card)}
            code={this.getCardCode(card)}
            selectedColor={
              this.props.playerColors[card.controlledBy] ?? "black"
            }
            controlledBy={card.controlledBy}
            key={card.id}
            id={card.id}
            x={card.x}
            y={card.y}
            exhausted={card.exhausted}
            fill={card.fill}
            selected={card.selected}
            dragging={card.dragging}
            shuffling={card.shuffling}
            handleDragStart={this.handleCardDragStart}
            handleDragMove={this.props.cardMove}
            handleDragEnd={this.handleCardDragEnd}
            imgUrls={getImgUrls(
              card,
              this.props.cardsData,
              this.props.currentGameType
            )}
            typeCode={getCardType(card, this.props.cardsData)}
            faceup={card.faceup}
            numCardsInStack={card.cardStack.length}
          />
        );
      });

    const iAmDragging = this.props.cards.cards.some(
      (c) => c.dragging && c.controlledBy === myPeerRef
    );

    const possiblePreviewCards = !!this.props.menuPreviewCard
      ? [this.props.menuPreviewCard]
      : this.props.cards.cards.filter(
          (card) =>
            !!this.props.gameState.previewCard &&
            card.id === this.props.gameState.previewCard.id
        );

    const previewCards = this.stage
      ? possiblePreviewCards
          .filter((_card) => !this.state.selecting && !iAmDragging)
          .map((card) => {
            const isHorizontal = HORIZONTAL_TYPE_CODES.includes(
              getCardType(card, this.props.cardsData)
            );
            const imgUrls = getImgUrls(
              card,
              this.props.cardsData,
              this.props.currentGameType
            );
            const rawPos = this.getRawPreviewCardPosition(isHorizontal);
            const previewPos = this.getRelativePositionFromTarget(
              this.stage,
              rawPos
            );

            let previewCardHeight = cardConstants.CARD_PREVIEW_HEIGHT;
            let previewCardWidth = cardConstants.CARD_PREVIEW_WIDTH;

            // Note that we only adjust the height, because the card will
            // be rotated if it supposed to be displayed horizontally
            previewCardHeight = Math.min(
              cardConstants.CARD_PREVIEW_HEIGHT,
              isHorizontal ? window.innerWidth : window.innerHeight
            );
            const previewCardRatio =
              previewCardHeight / cardConstants.CARD_PREVIEW_HEIGHT;
            previewCardWidth *= previewCardRatio;

            return imgUrls.some(
              (url) => url.indexOf("card_back") !== -1
            ) ? null : (
              <Card
                currentGameType={this.props.currentGameType}
                name={this.getCardName(card)}
                code={this.getCardCode(card)}
                selectedColor={
                  this.props.playerColors[card.controlledBy] ?? "black"
                }
                controlledBy={card.controlledBy}
                key={`preview${card.id}`}
                id={card.id}
                x={previewPos.x}
                y={previewPos.y}
                exhausted={isHorizontal}
                fill={card.fill}
                selected={false}
                dragging={false}
                shuffling={false}
                imgUrls={imgUrls}
                typeCode={getCardType(card, this.props.cardsData)}
                faceup={card.faceup}
                height={previewCardHeight / this.props.gameState.stageZoom.y}
                width={previewCardWidth / this.props.gameState.stageZoom.x}
                isPreview={true}
              />
            );
          })
          .filter((c): c is JSX.Element => c !== null)
      : [];

    const playmatScale =
      this.state.playmatImageLoaded && !!this.state.playmatImage?.naturalWidth
        ? 2880 / this.state.playmatImage?.naturalWidth
        : 1;

    return (
      <div
        className="play-area"
        // tabIndex={0} // For some reason this makes safari super slow....
        onMouseUp={(_event) => {
          if (this.props.gameState.draggingCardFromHand) {
            this.captureLastMousePos = false;
          }
        }}
        onTouchEnd={(_event) => {
          if (this.props.gameState.draggingCardFromHand) {
            this.captureLastMousePos = false;
          }

          if (this.props.gameState.drawingArrow) {
            this.props.setDrawingArrow(false);
            this.props.removeAnyDisconnectedArrows(myPeerRef);
          }
        }}
        onTouchMove={(event) => {
          if (event.touches.length > 0) {
            if (this.captureLastMousePos) {
              this.lastMousePos = {
                x: event.touches.item(0).clientX,
                y: event.touches.item(0).clientY,
              };
            }

            if (this.props.gameState.draggingCardFromHand) {
              this.props.cardFromHandMove(
                this.getRelativePositionFromTarget(
                  this.stage,
                  this.lastMousePos
                )
              );
            }
          }
        }}
        onMouseMove={(event) => {
          if (this.captureLastMousePos) {
            this.lastMousePos = { x: event.clientX, y: event.clientY };
          }

          if (this.props.gameState.draggingCardFromHand) {
            this.props.cardFromHandMove(
              this.getRelativePositionFromTarget(this.stage, this.lastMousePos)
            );
          }
        }}
      >
        <PlayerHandContainer
          playerNumber={this.props.playerNumbers[myPeerRef] ?? 1}
          droppedBackInHand={() => {
            this.captureLastMousePos = true;
            this.props.clearMyGhostCards();
          }}
          droppedOnTable={(id: string, pos?: Vector2d) => {
            const myDropTargetCard =
              Object.values(this.props.dropTargetCardsById).filter(
                (dt) => dt.ownerRef === myPeerRef
              )[0] ?? null;
            if (!!myDropTargetCard) {
              this.props.addToExistingCardStack({
                existingStackId: myDropTargetCard.card?.id ?? "",
                cardJsonIds: [id],
              });
            } else {
              this.props.addCardStack({
                cardJsonIds: [id],
                position: this.getRelativePositionFromTarget(
                  this.stage,
                  !!pos ? pos : this.lastMousePos
                ),
              });
            }
            this.props.clearMyGhostCards();
            this.captureLastMousePos = true;
          }}
        ></PlayerHandContainer>
        <SpecificCardLoaderContainer
          cardSelected={(id) => {
            this.props.addCardStack({
              cardJsonIds: [id],
              position: this.getRelativePositionFromTarget(
                this.stage,
                this.lastMousePos
              ),
            });
          }}
        ></SpecificCardLoaderContainer>
        <DeckSearchContainer
          loadDeckId={this.handleImportDeck(
            !!this.stage
              ? this.getRelativePositionFromTarget(
                  this.stage,
                  this.lastMousePos
                )
              : { x: 0, y: 0 }
          )}
        ></DeckSearchContainer>
        <NotesContainer></NotesContainer>
        {this.renderEmptyMessage()}
        {this.renderContextMenu()}
        {this.renderPreviewCardModal()}
        {this.renderOptionsMenu()}
        {this.renderContextualOptionsMenu()}
        {this.renderDeckImporter()}
        {this.renderEncounterImporter()}
        {this.renderCardSearch()}
        {this.renderPeerConnector()}
        {this.renderTokenModifier()}

        <ReactReduxContext.Consumer>
          {({ store }) => (
            <div>
              <Provider store={store}>
                <CardtableAlertsContainer></CardtableAlertsContainer>
                <NotificationsContainer></NotificationsContainer>
              </Provider>
              <Stage
                ref={(ref) => {
                  if (!ref) return;

                  this.stage = ref;
                }}
                x={this.props.gameState.stagePosition.x}
                y={this.props.gameState.stagePosition.y}
                width={this.state.stageWidth}
                height={this.state.stageHeight}
                onClick={this.handleStageClickOrTap}
                onTap={this.handleStageClickOrTap}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
                onContextMenu={this.handleContextMenu}
                scale={this.props.gameState.stageZoom}
                onWheel={this.handleWheel}
                draggable={this.props.panMode}
                onDragMove={this.noOp}
                onDragEnd={this.noOp}
                preventDefault={true}
              >
                <Provider store={store}>
                  <Layer>
                    <Group>
                      <Rect
                        fill={
                          this.state.playmatImageLoaded
                            ? undefined
                            : "lightgray"
                        }
                        scale={{
                          x: playmatScale,
                          y: playmatScale,
                        }}
                        width={
                          this.state.playmatImageLoaded
                            ? this.state.playmatImage?.naturalWidth
                            : 2880
                        }
                        height={
                          this.state.playmatImageLoaded
                            ? this.state.playmatImage?.naturalHeight
                            : 1440
                        }
                        fillPatternImage={
                          this.state.playmatImageLoaded &&
                          !!this.state.playmatImage
                            ? this.state.playmatImage
                            : undefined
                        }
                      ></Rect>
                    </Group>
                    <Group>
                      {this.props.counters.map((counter) => (
                        <Counter
                          key={`${counter.id}-counter`}
                          id={counter.id}
                          pos={counter.position}
                          value={counter.value}
                          color={counter.color}
                          updateCounterValueBy={this.handleCounterValueUpdate(
                            counter.id
                          )}
                          handleContextMenu={this.handleCounterContextMenu(
                            counter.id
                          )}
                          onDragEnd={this.handleCounterDrag(counter.id)}
                        ></Counter>
                      ))}
                    </Group>
                    <Group preventDefault={true}>
                      {ghostCards.concat(staticCards).concat(movingCards)}

                      <FirstPlayerTokenContainer
                        currentGameType={this.props.currentGameType}
                      ></FirstPlayerTokenContainer>
                      <CurvedArrowsContainer></CurvedArrowsContainer>
                      {previewCards}
                    </Group>
                    <Group>
                      <Rect
                        x={this.state.selectStartPos.x}
                        y={this.state.selectStartPos.y}
                        width={this.state.selectRect.width}
                        height={this.state.selectRect.height}
                        stroke="yellow"
                        strokeWidth={4}
                      />
                    </Group>
                  </Layer>
                </Provider>
              </Stage>
            </div>
          )}
        </ReactReduxContext.Consumer>
      </div>
    );
  }

  private handleCounterValueUpdate = (id: string) => (delta: number) => {
    this.props.updateCounterValue({ id, delta });
  };

  private handleCounterDrag =
    (id: string) => (event: KonvaEventObject<DragEvent>) => {
      this.props.moveCounter({
        id,
        newPos: {
          x: event.target.x(),
          y: event.target.y(),
        },
      });
    };

  private noOp = () => {};

  private renderEmptyMessage = () => {
    const open =
      this.props.cards.cards.length === 0 && this.state.showEmptyMessage;
    if (!open) return null;

    const handleClose = (
      event: React.SyntheticEvent | Event,
      reason?: string
    ) => {
      if (reason === "clickaway") {
        return;
      }

      this.setState({ showEmptyMessage: false });
    };

    const action = (
      <React.Fragment>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    );

    const message = (
      <React.Fragment>
        <div className="snack-text">
          Use the
          <MoreVertIcon fontSize="small" />
          button to load a deck or scenario
        </div>
      </React.Fragment>
    );

    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={true}
        message={message}
        action={action}
        sx={{
          left: "55px",
        }}
      />
    );
  };

  private renderContextMenu = () => {
    if (!this.state.showContextMenu) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.contextMenuPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing context menu position");
    }

    return (
      <ContextMenu
        position={{
          x: containerRect.left + pointerPosition.x,
          y: containerRect.top + pointerPosition.y,
        }}
        items={this.state.contextMenuItems}
        hideContextMenu={() => this.clearContextMenu()}
      ></ContextMenu>
    );
  };

  private renderPreviewCardModal = () => {
    if (!this.state.previewCardModal) return null;
    return (
      <TopLayer
        position={{ x: 0, y: 0 }}
        completed={() => {
          this.props.clearPreviewCard();
          this.setState({
            previewCardModal: false,
          });
        }}
      ></TopLayer>
    );
  };

  private renderOptionsMenu = () => {
    return (
      <OptionsMenuContainer
        showContextMenuAtPosition={(pos: Vector2d) => {
          this.handleContextMenu(undefined, pos);
        }}
      ></OptionsMenuContainer>
    );
  };

  private renderContextualOptionsMenu = () => {
    return (
      <ContextualOptionsMenuContainer
        showCardSelector={(card, isSelect) => {
          const containerRect = this.stage?.container().getBoundingClientRect();
          this.setState({
            showCardSearch: true,
            cardSearchTouchBased: isSelect,
            cardSearchPosition: containerRect
              ? {
                  x: (containerRect.right - containerRect.left) / 2 - 100,
                  y: (containerRect.bottom - containerRect.top) / 4,
                }
              : null,
            cardStackForSearching: card,
          });
        }}
      ></ContextualOptionsMenuContainer>
    );
  };

  private renderDeckImporter = () => {
    if (!this.state.showDeckImporter) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.deckImporterPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing deck importer position");
    }

    return (
      <TopLayer
        position={{
          x: containerRect.left + pointerPosition.x,
          y: containerRect.top + pointerPosition.y,
        }}
        completed={this.clearDeckImporter}
      >
        <DeckLoader
          loadDeckId={this.handleImportDeck(
            this.getRelativePositionFromTarget(this.stage)
          )}
        />
      </TopLayer>
    );
  };

  private renderEncounterImporter = () => {
    if (!this.state.showEncounterImporter) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.encounterImporterPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing deck importer position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: containerRect.top + pointerPosition.y,
    };

    return (
      <TopLayer position={pos} completed={this.clearEncounterImporter}>
        <EncounterLoaderContainer
          currentGameType={this.props.currentGameType}
          loadCards={this.handleLoadEncounter(
            this.getRelativePositionFromTarget(this.stage)
          )}
        />
      </TopLayer>
    );
  };

  private renderCardSearch = () => {
    if (!this.state.showCardSearch) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.cardSearchPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing card search position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: containerRect.top + pointerPosition.y,
    };

    return !!this.state.cardStackForSearching ? (
      <TopLayer position={pos} completed={this.clearCardSearch}>
        <CardStackCardSelectorContainer
          touchBased={this.state.cardSearchTouchBased}
          card={this.state.cardStackForSearching}
          cardSelected={this.handleCardSelectedFromCardStack(
            this.state.cardStackForSearching.id,
            pos
          )}
        />
      </TopLayer>
    ) : null;
  };

  private renderPeerConnector = () => {
    if (!this.state.showPeerConnector) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.peerConnectorPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing peer connector position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: containerRect.top + pointerPosition.y,
    };

    return !!this.state.showPeerConnector ? (
      <TopLayer position={pos} completed={this.clearPeerConnector}>
        <PeerConnector connect={this.handlePeerConnect}></PeerConnector>
      </TopLayer>
    ) : null;
  };

  private renderTokenModifier = () => {
    if (!this.state.showTokenValueModifier) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.tokenValueModifierPosition;
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing token Modifier position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: containerRect.top + pointerPosition.y,
    };

    return !!this.state.showTokenValueModifier &&
      !!this.state.tokenValueModifierProps ? (
      <TopLayer position={pos} completed={this.clearTokenValueModifier}>
        <TokenValueModifier
          id={this.state.tokenValueModifierProps.id}
          tokenType={this.state.tokenValueModifierProps.tokenType}
          updated={(payload) => {
            this.props.adjustCounterToken(payload);
            this.clearTokenValueModifier();
          }}
        ></TokenValueModifier>
      </TopLayer>
    ) : null;
  };

  private handleLoadEncounter = (position: Vector2d) => (cards: string[][]) => {
    this.clearEncounterImporter();
    cards.forEach((c, index) => {
      this.props.addCardStack({
        position: {
          x: position.x + cardConstants.GRID_SNAP_WIDTH * index,
          y: position.y,
        },
        cardJsonIds: c,
      });
    });

    // Cache the images
    const imgUrls = cards.flat().reduce((urls, code) => {
      const faceupCard = getImgUrlsFromJsonId(
        code,
        true,
        this.props.cardsData,
        this.props.currentGameType
      );
      const facedownCard = getImgUrlsFromJsonId(
        code,
        false,
        this.props.cardsData,
        this.props.currentGameType
      );
      return urls.concat(faceupCard, facedownCard);
    }, [] as string[]);

    const uniqueUrls = Array.from(new Set(imgUrls));

    cacheImages(uniqueUrls);
  };

  private handleImportDeck = (position: Vector2d) => (id: number) => {
    this.clearDeckImporter();
    this.props.fetchDecklistById({
      gameType: this.props.currentGameType,
      decklistId: id,
      position,
    });
  };

  private handlePeerConnect = (peerId: string) => {
    this.clearPeerConnector();
    this.props.connectToRemoteGame(peerId);
  };

  private handleCardSelectedFromCardStack =
    (cardStackId: string, pos: Vector2d) => (jsonId: string) => {
      this.clearCardSearch();
      this.props.pullCardOutOfCardStack({ cardStackId, jsonId, pos });
    };

  private clearContextMenu = () => {
    this.setState({
      showContextMenu: false,
      contextMenuPosition: null,
      contextMenuItems: [],
    });
  };

  private clearDeckImporter = () => {
    this.setState({
      showDeckImporter: false,
      deckImporterPosition: null,
    });
  };

  private clearTokenValueModifier = () => {
    this.setState({
      showTokenValueModifier: false,
      tokenValueModifierProps: null,
      tokenValueModifierPosition: null,
    });
  };

  private clearEncounterImporter = () => {
    this.setState({
      showEncounterImporter: false,
      encounterImporterPosition: null,
    });
  };

  private clearCardSearch = () => {
    this.setState({
      showCardSearch: false,
      cardSearchTouchBased: false,
      cardSearchPosition: null,
      cardStackForSearching: null,
    });
  };

  private clearPeerConnector = () => {
    this.setState({
      showPeerConnector: false,
      peerConnectorPosition: null,
    });
  };

  private handleStageClickOrTap = (event: KonvaEventObject<MouseEvent>) => {
    if (this.state.showContextMenu) {
      return;
    }
    const mousePos = this.getRelativePositionFromTarget(this.stage);
    if (
      this.props.panMode ||
      getDistance(this.state.selectStartPos, mousePos) < 30
    ) {
      this.props.unselectAllCards();
    }
  };

  private handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();

    if (!this.stage) return;

    var oldScale = this.props.gameState.stageZoom.x;

    const pointer = this.stage.getPointerPosition() ?? { x: 0, y: 0 };

    const mousePointTo = {
      x: (pointer.x - this.stage.x()) / oldScale,
      y: (pointer.y - this.stage.y()) / oldScale,
    };

    const newScale =
      event.evt.deltaY < 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

    this.props.updateZoom({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    this.props.updatePosition(newPos);
  };

  private handleCounterContextMenu =
    (counterId: string) => (event: KonvaEventObject<PointerEvent>) => {
      event.evt.preventDefault();
      event.cancelBubble = true;

      const counter = this.props.counters.find((c) => c.id === counterId);

      const menuItems: ContextMenuItem[] = [
        {
          label: "Remove",
          action: () => {
            this.props.removeCounter(counterId);
          },
        },
        {
          label: "Reset",
          action: () => {
            this.props.updateCounterValue({
              id: counterId,
              delta: (counter?.value ?? 0) * -1,
            });
          },
        },
        {
          label: "Set Color",
          children: possibleColors.map((color) => {
            return {
              label: color,
              action: () => {
                this.props.updateCounterColor({
                  id: counterId,
                  newColor: color,
                });
              },
            };
          }),
        },
      ];

      this.setState({
        showContextMenu: true,
        contextMenuPosition: this.stage?.getPointerPosition() ?? null,
        contextMenuItems: menuItems,
      });
    };

  private handleCardContextMenu = (
    cardId: string,
    event: KonvaEventObject<PointerEvent>
  ) => {
    event.evt.preventDefault();
    event.cancelBubble = true;

    // We want to unselect all the other cards if the card isn't actively selected
    const cardStack = this.props.cards.cards.find((c) => c.id === cardId);

    // Next, select the card that was right-clicked
    this.props.selectCard({
      id: cardId,
      unselectOtherCards: !!cardStack ? !cardStack.selected : true,
    });

    const card = this.props.cards.cards.find((c) => c.id === cardId);
    const numCardsInStack = card?.cardStack?.length || 0;

    const mySelectedCards = getMySelectedCards(this.props.cards.cards);

    const menuItems: ContextMenuItem[] = [
      {
        label: "Add all to hand",
        action: () => {
          this.props.addToPlayerHand({
            playerNumber:
              this.props.gameState.currentVisiblePlayerHandNumber ??
              this.props.gameState.playerNumbers[myPeerRef],
          });
        },
      },
      {
        label: "Flip",
        action: () => {
          this.props.flipCards();
        },
      },
    ];

    if (numCardsInStack > 1) {
      menuItems.push({
        label: "Shuffle",
        action: () => {
          this.props.shuffleStack();
        },
      });

      menuItems.push({
        label: "Find Specific Card",
        action: () => {
          if (!!card) {
            this.setState({
              showCardSearch: true,
              cardSearchPosition: this.stage?.getPointerPosition() ?? null,
              cardStackForSearching: card,
            });
          }
        },
      });
    }

    menuItems.push({
      label: "Delete",
      action: () => {
        this.props.deleteCardStack();
      },
    });

    menuItems.push({
      label: "Save Deck as json file",
      action: () => {
        this.props.saveDeckAsJson(card);
      },
    });

    const tokenInfoForGameType =
      GamePropertiesMap[this.props.currentGameType].tokens;

    if (!!tokenInfoForGameType.stunned) {
      if (tokenInfoForGameType.stunned.canStackMultiple) {
        // Add status token
        menuItems.push({
          label: `Add ${tokenInfoForGameType.stunned.menuText}`,
          action: () => {
            this.props.adjustStatusToken({
              tokenType: StatusTokenType.Stunned,
              delta: 1,
            });
          },
        });

        if (card?.statusTokens?.stunned ?? -1 > 0) {
          // Remove status token
          menuItems.push({
            label: `Remove ${tokenInfoForGameType.stunned.menuText}`,
            action: () => {
              this.props.adjustStatusToken({
                tokenType: StatusTokenType.Stunned,
                delta: -1,
              });
            },
          });
        }
      } else {
        menuItems.push({
          label: anyCardStackHasStatus(StatusTokenType.Stunned, mySelectedCards)
            ? tokenInfoForGameType.stunned.menuRemoveText
            : tokenInfoForGameType.stunned.menuText,
          action: () => {
            this.props.toggleToken({
              id: card?.id || "",
              tokenType: StatusTokenType.Stunned,
              value: !anyCardStackHasStatus(
                StatusTokenType.Stunned,
                mySelectedCards
              ),
            });
          },
        });
      }
    }

    if (!!tokenInfoForGameType.confused) {
      if (tokenInfoForGameType.confused.canStackMultiple) {
        // Add status token
        menuItems.push({
          label: `Add ${tokenInfoForGameType.confused.menuText}`,
          action: () => {
            this.props.adjustStatusToken({
              tokenType: StatusTokenType.Confused,
              delta: 1,
            });
          },
        });

        if (card?.statusTokens?.confused ?? -1 > 0) {
          // Remove status token
          menuItems.push({
            label: `Remove ${tokenInfoForGameType.confused.menuText}`,
            action: () => {
              this.props.adjustStatusToken({
                tokenType: StatusTokenType.Confused,
                delta: -1,
              });
            },
          });
        }
      } else {
        menuItems.push({
          label: anyCardStackHasStatus(
            StatusTokenType.Confused,
            mySelectedCards
          )
            ? tokenInfoForGameType.confused.menuRemoveText
            : tokenInfoForGameType.confused.menuText,
          action: () => {
            this.props.toggleToken({
              id: card?.id || "",
              tokenType: StatusTokenType.Confused,
              value: !anyCardStackHasStatus(
                StatusTokenType.Confused,
                mySelectedCards
              ),
            });
          },
        });
      }
    }

    if (!!tokenInfoForGameType.tough) {
      if (tokenInfoForGameType.tough.canStackMultiple) {
        // Add status token
        menuItems.push({
          label: `Add ${tokenInfoForGameType.tough.menuText}`,
          action: () => {
            this.props.adjustStatusToken({
              tokenType: StatusTokenType.Tough,
              delta: 1,
            });
          },
        });

        if (card?.statusTokens?.tough ?? -1 > 0) {
          // Remove status token
          menuItems.push({
            label: `Remove ${tokenInfoForGameType.tough.menuText}`,
            action: () => {
              this.props.adjustStatusToken({
                tokenType: StatusTokenType.Tough,
                delta: -1,
              });
            },
          });
        }
      } else {
        menuItems.push({
          label: anyCardStackHasStatus(StatusTokenType.Tough, mySelectedCards)
            ? tokenInfoForGameType.tough.menuRemoveText
            : tokenInfoForGameType.tough.menuText,
          action: () => {
            this.props.toggleToken({
              id: card?.id || "",
              tokenType: StatusTokenType.Tough,
              value: !anyCardStackHasStatus(
                StatusTokenType.Tough,
                mySelectedCards
              ),
            });
          },
        });
      }
    }

    if (!!tokenInfoForGameType.damage) {
      menuItems.push({
        label: tokenInfoForGameType.damage.menuText,
        action: () => {
          this.setState({
            showContextMenu: false,
            contextMenuItems: [],
            contextMenuPosition: null,

            showTokenValueModifier: true,
            tokenValueModifierProps: {
              id: card?.id || "",
              tokenType: CounterTokenType.Damage,
            },
            tokenValueModifierPosition:
              this.stage?.getPointerPosition() ?? null,
          });
        },
      });
    }

    if (!!tokenInfoForGameType.threat) {
      menuItems.push({
        label: tokenInfoForGameType.threat.menuText,
        action: () => {
          this.setState({
            showContextMenu: false,
            contextMenuItems: [],
            contextMenuPosition: null,

            showTokenValueModifier: true,
            tokenValueModifierProps: {
              id: card?.id || "",
              tokenType: CounterTokenType.Threat,
            },
            tokenValueModifierPosition:
              this.stage?.getPointerPosition() ?? null,
          });
        },
      });
    }

    if (!!tokenInfoForGameType.generic) {
      menuItems.push({
        label: tokenInfoForGameType.generic.menuText,
        action: () => {
          this.setState({
            showContextMenu: false,
            contextMenuItems: [],
            contextMenuPosition: null,

            showTokenValueModifier: true,
            tokenValueModifierProps: {
              id: card?.id || "",
              tokenType: CounterTokenType.Generic,
            },
            tokenValueModifierPosition:
              this.stage?.getPointerPosition() ?? null,
          });
        },
      });
    }

    menuItems.push({
      label: "Remove All Tokens",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Damage,
          value: 0,
        });

        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Threat,
          value: 0,
        });

        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Generic,
          value: 0,
        });
      },
    });

    const modifiersForGameType =
      GamePropertiesMap[this.props.currentGameType].modifiers;

    const extraIconsForGameType =
      GamePropertiesMap[this.props.currentGameType].possibleIcons;

    if (modifiersForGameType.length > 0) {
      menuItems.push({
        label: "Modifiers",
        children: modifiersForGameType
          .map((m) => {
            return {
              label: m.attributeName,
              children: [
                {
                  label: "Add 1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      delta: 1,
                    });
                  },
                },
                {
                  label: "Remove 1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      delta: -1,
                    });
                  },
                },
                {
                  label: "-3",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: -3,
                    });
                  },
                },
                {
                  label: "-2",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: -2,
                    });
                  },
                },
                {
                  label: "-1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: -1,
                    });
                  },
                },
                {
                  label: "0",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: 0,
                    });
                  },
                },
                {
                  label: "1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: 1,
                    });
                  },
                },
                {
                  label: "2",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: 2,
                    });
                  },
                },
                {
                  label: "3",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      value: 3,
                    });
                  },
                },
              ],
            } as ContextMenuItem;
          })
          .concat(
            extraIconsForGameType.length > 0
              ? [
                  {
                    label: "Add Icon",
                    children: extraIconsForGameType.map((icon) => ({
                      label: icon.iconName,
                      action: () => {
                        this.props.addExtraIcon(icon.iconId);
                      },
                    })),
                  },
                  {
                    label: "Remove Icon",
                    children: extraIconsForGameType.map((icon) => ({
                      label: icon.iconName,
                      action: () => {
                        this.props.removeExtraIcon(icon.iconId);
                      },
                    })),
                  },
                ]
              : []
          )
          .concat([
            {
              label: "Clear all modifiers",
              action: () => {
                this.props.clearAllModifiers({ id: card?.id || "" });
              },
            },
          ]),
      });
    }

    this.setState({
      showContextMenu: true,
      contextMenuPosition: this.stage?.getPointerPosition() ?? null,
      contextMenuItems: menuItems,
    });
  };

  private handleCardClick =
    (card: ICardStack) =>
    (
      cardId: string,
      event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
      wasTouch: boolean
    ) => {
      // Here check if modifier held down
      const modifierKeyHeld =
        event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey;

      if (card.selected && (modifierKeyHeld || this.props.multiselectMode)) {
        this.props.toggleSelectCard(cardId);
      } else {
        this.props.selectCard({
          id: cardId,
          unselectOtherCards: !modifierKeyHeld && !this.props.multiselectMode,
        });

        if (
          wasTouch &&
          !modifierKeyHeld &&
          !this.props.multiselectMode &&
          !this.doubleTapTimer &&
          !this.state.showContextMenu
        ) {
          this.doubleTapTimer = setTimeout(() => {
            this.props.showRadialMenuAtPosition(
              this.stage?.getPointerPosition() || { x: 0, y: 0 }
            );
            this.doubleTapTimer = null;
          }, 200);
        }
      }
    };

  private handleStartArrow = (id: string) => {
    this.props.startNewArrow(id);
  };

  private handleEndArrow = (id: string) => {
    if (this.props.gameState.drawingArrow) {
      this.props.setDrawingArrow(false);
    }
    this.props.endDisconnectedArrow({ endCardId: id, myRef: myPeerRef });
  };

  private handleSelectAndExhaust = (
    cardId: string,
    event: KonvaEventObject<MouseEvent>
  ) => {
    // Here check if modifier held down
    const modifierKeyHeld =
      event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey;
    this.props.selectCard({ id: cardId, unselectOtherCards: !modifierKeyHeld });
    this.props.exhaustCard(cardId);
  };

  private showOrToggleModalPreviewCard = (
    cardId: string,
    _event: KonvaEventObject<TouchEvent>
  ) => {
    // Clear the timer if we were waiting
    if (!!this.doubleTapTimer) {
      clearTimeout(this.doubleTapTimer);
      this.doubleTapTimer = null;
    }

    if (
      !!this.props.gameState.previewCard &&
      this.props.gameState.previewCard.id === cardId
    ) {
      this.props.clearPreviewCard();
    } else {
      this.setState({
        previewCardModal: true,
      });
      this.props.setPreviewCardId(cardId);
    }
  };

  private handleCardDragStart = (
    cardId: string,
    event: KonvaEventObject<DragEvent>
  ) => {
    let splitTopCard = false;
    // If multiple things are selected, you can't pull something off the top of a stack,
    // so just do a normal drag
    const multipleSelected =
      this.props.cards.cards.filter(
        (c) => c.selected && c.controlledBy === myPeerRef
      ).length > 1;

    if (!multipleSelected) {
      const draggingCard = this.props.cards.cards.find((c) => c.id === cardId);
      const hasStack = (draggingCard?.cardStack || []).length > 1;
      if (!!draggingCard && hasStack) {
        // Check if we're dragging in the upper right corner of the card
        const upperRightPoint = {
          x:
            draggingCard.x +
            (draggingCard.exhausted
              ? cardConstants.CARD_HEIGHT
              : cardConstants.CARD_WIDTH) /
              2,
          y:
            draggingCard.y -
            (draggingCard.exhausted
              ? cardConstants.CARD_WIDTH
              : cardConstants.CARD_HEIGHT) /
              2,
        };
        const distance = getDistance(
          upperRightPoint,
          this.getRelativePositionFromTarget(this.stage)
        );

        const dragDistanceThreshold = !!(event.evt as any).touches
          ? cardConstants.TOUCH_DRAG_SPLIT_DISTANCE
          : cardConstants.MOUSE_DRAG_SPLIT_DISTANCE;

        if (distance < dragDistanceThreshold) {
          splitTopCard = true;
        }
      }
    }

    this.props.startCardMove({ id: cardId, splitTopCard });
  };

  private handleCardDragEnd = (
    cardId: string,
    event: KonvaEventObject<DragEvent>
  ) => {
    // const verticalMax = window.innerHeight;
    const verticalMin = window.innerHeight - playerHandHeightPx;
    // const max = { x: 0, y: verticalMax };
    const min = { x: 0, y: verticalMin };

    // const translatedMax = this.getRelativePositionFromTarget(this.stage, max);
    const translatedMin = this.getRelativePositionFromTarget(this.stage, min);
    this.props.endCardMove(cardId);

    if (event.target.y() > translatedMin.y) {
      this.props.addToPlayerHand({
        playerNumber:
          this.props.gameState.currentVisiblePlayerHandNumber ??
          this.props.gameState.playerNumbers[myPeerRef],
      });
    }
  };

  private handleKeyPress = (event: KeyboardEvent) => {
    const modifier: boolean = event.ctrlKey || event.metaKey;
    const code = event.key.toLocaleLowerCase();
    const intCode = parseInt(code);
    if (code === "p") {
      this.props.togglePanMode();
    } else if (code === "f") {
      this.props.flipCards();
    } else if (code === "h") {
      this.props.toggleDrawCardsIntoHand();
    } else if (code === "g") {
      this.props.toggleSnapCardsToGrid();
    } else if (code === "n") {
      this.props.toggleNotes();
    } else if (code === "?") {
      window.open(
        "https://erlloyd.github.io/cardtable-docs/",
        "_blank",
        "noreferrer"
      );
    } else if (code === "e") {
      this.props.exhaustCard();
    } else if (code === "s") {
      this.props.shuffleStack();
    } else if (!Number.isNaN(intCode)) {
      // if a ctrl / cmd key was held, we're
      // adding tokens
      if (modifier) {
      } else {
        // First, get the selected card stack
        const mySelectedCards = getMySelectedCards(this.props.cards.cards);
        if (mySelectedCards.length !== 1) {
          log.info(
            "will not be drawing any cards because the number of selected stacks is " +
              mySelectedCards.length
          );
        } else {
          this.props.drawCardsOutOfCardStack({
            cardStackId: mySelectedCards[0].id,
            numberToDraw: intCode,
          });
        }
      }
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const code = event.key.toLocaleLowerCase();
    const intCode = parseInt(code);

    if (event.key === "a" && !this.props.gameState.drawingArrow) {
      this.props.setDrawingArrow(true);
    }

    if ((event.ctrlKey || event.metaKey) && !Number.isNaN(intCode)) {
      const tokenInfoForGameType =
        GamePropertiesMap[this.props.currentGameType].tokens;
      switch (intCode) {
        case 1:
          if (!!tokenInfoForGameType.damage) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Damage,
              delta: 1,
            });
          }
          break;
        case 2:
          if (!!tokenInfoForGameType.threat) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Threat,
              delta: 1,
            });
          }
          break;

        case 3:
          if (!!tokenInfoForGameType.generic) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Generic,
              delta: 1,
            });
          }
          break;
        case 4:
          if (!!tokenInfoForGameType.damage) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Damage,
              delta: -1,
            });
          }
          break;
        case 5:
          if (!!tokenInfoForGameType.threat) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Threat,
              delta: -1,
            });
          }
          break;

        case 6:
          if (!!tokenInfoForGameType.generic) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Generic,
              delta: -1,
            });
          }
          break;
      }
      event.preventDefault();
    }

    if (
      event.shiftKey &&
      (event.ctrlKey || event.metaKey) &&
      event.key === "z"
    ) {
      this.props.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key === "z") {
      event.preventDefault();
      this.props.undo();
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "a" && this.props.gameState.drawingArrow) {
      this.props.setDrawingArrow(false);
      this.props.removeAnyDisconnectedArrows(myPeerRef);
    } else if (
      event.key.toLocaleLowerCase() === "delete" ||
      event.key.toLocaleLowerCase() === "backspace"
    ) {
      this.props.deleteCardStack();
    }
  };

  private getRawPreviewCardPosition = (horizontal: boolean): Vector2d => {
    const pointerPos = this.stage?.getPointerPosition() ?? { x: 0, y: 0 };
    const screenMidPointX = window.innerWidth / 2;
    const screenMidPointY = window.innerHeight / 2;

    const widthToUse = horizontal
      ? cardConstants.CARD_PREVIEW_HEIGHT
      : cardConstants.CARD_PREVIEW_WIDTH;
    const heightToUse = horizontal
      ? cardConstants.CARD_PREVIEW_WIDTH
      : cardConstants.CARD_PREVIEW_HEIGHT;

    if (this.state.previewCardModal) {
      return {
        x: screenMidPointX,
        y: screenMidPointY,
      };
    }

    // const mySelectedCards = getMySelectedCards(this.props.cards.cards);
    // const anySelectedCards = mySelectedCards.length > 0;
    const anySelectedCards = true;
    return pointerPos.x < screenMidPointX
      ? {
          x: window.innerWidth - widthToUse / 2 - (anySelectedCards ? 95 : 0),
          y: heightToUse / 2,
        }
      : {
          x: widthToUse / 2 + 55,
          y: heightToUse / 2,
        };
  };

  private getRelativePositionFromTarget = (
    target: any,
    posParam?: Vector2d
  ) => {
    const transform = target.getAbsoluteTransform().copy();
    transform.invert();
    let pos = posParam || target.getPointerPosition();
    return transform.point(pos ?? { x: 20, y: 20 }) as Vector2d;
  };

  private handleMouseDown = (
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>
  ) => {
    // If we're in pan mode and not drawing an arrow, there is nothing to do
    if (this.props.panMode && !this.props.gameState.drawingArrow) {
      return false;
    }

    if (
      (event.evt instanceof MouseEvent && event.evt.button === 0) ||
      !!(event.evt as TouchEvent).touches
    ) {
      // Only do something if it's the primary button (not a right-click)
      const pos = this.getRelativePositionFromTarget(this.stage);

      this.setState({
        selectStartPos: {
          x: pos.x,
          y: pos.y,
        },
        selecting: true,
      });
    }

    return false;
  };

  private getSelectionRectInfo = () => {
    const selectStartPos = this.state.selectStartPos;
    const selectRect = this.state.selectRect;
    return {
      height: Math.abs(selectRect.height),
      width: Math.abs(selectRect.width),
      x:
        selectRect.width < 0
          ? selectStartPos.x + selectRect.width
          : selectStartPos.x,
      y:
        selectRect.height < 0
          ? selectStartPos.y + selectRect.height
          : selectStartPos.y,
    };
  };

  private handleMouseUp = (
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>
  ) => {
    // If we're in pan mode and not drawing an arrow, there is nothing to do
    if (this.props.panMode && !this.props.gameState.drawingArrow) {
      return false;
    }
    // if we were selecting, check for intersection
    if (this.state.drewASelectionRect) {
      const selectRect = this.getSelectionRectInfo();
      const selectedCards: any[] = this.props.cards.cards.reduce<ICardStack[]>(
        (currSelectedCards, card) => {
          const intersects = Intersects.boxBox(
            selectRect.x,
            selectRect.y,
            selectRect.width,
            selectRect.height,
            card.x - 50,
            card.y - 75,
            cardConstants.CARD_WIDTH,
            cardConstants.CARD_HEIGHT
          );

          if (intersects) {
            currSelectedCards.push(card);
          }

          return currSelectedCards;
        },
        []
      );

      // Here check if modifier held down
      const modifierKeyHeld =
        event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey;

      this.props.selectMultipleCards({
        ids: selectedCards.map((card) => card.id),
        unselectOtherCards: !modifierKeyHeld,
      });
    }

    this.setState({
      drewASelectionRect: false,
      selectRect: {
        height: 0,
        width: 0,
      },
      selecting: false,
    });

    return false;
  };

  private handleTouchStart = (event: KonvaEventObject<TouchEvent>) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.handleContextMenu(event);
    }, 750);

    this.handleMouseDown(event);
  };

  private handleTouchMove = (e: any) => {
    e.evt.preventDefault();

    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    if (touch1 && touch2) {
      this.handleMultiTouch(touch1, touch2);
    } else {
      this.handleMouseMove(e);
    }
  };

  private handleMultiTouch = (touch1: any, touch2: any) => {
    if (!this.stage) {
      return;
    }
    // if the stage was under Konva's drag&drop
    // we need to stop it, and implement our own pan logic with two pointers
    if (this.stage.isDragging()) {
      this.stage.stopDrag();
    }

    const p1 = {
      x: touch1.clientX,
      y: touch1.clientY,
    };
    const p2 = {
      x: touch2.clientX,
      y: touch2.clientY,
    };

    if (!this.lastCenter) {
      this.lastCenter = getCenter(p1, p2);
      return;
    }
    const newCenter = getCenter(p1, p2);

    const dist = getDistance(p1, p2);

    if (!this.lastDist) {
      this.lastDist = dist;
    }

    // local coordinates of center point
    const pointTo = {
      x: (newCenter.x - this.stage.x()) / this.props.gameState.stageZoom.x,
      y: (newCenter.y - this.stage.y()) / this.props.gameState.stageZoom.y,
    };

    const scale = this.props.gameState.stageZoom.x * (dist / this.lastDist);
    this.props.updateZoom({ x: scale, y: scale });

    // calculate new position of the stage
    const dx = newCenter.x - this.lastCenter.x;
    const dy = newCenter.y - this.lastCenter.y;

    const newPos = {
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
    };

    this.props.updatePosition(newPos);

    this.lastDist = dist;
    this.lastCenter = newCenter;
  };

  private handleTouchEnd = (event: KonvaEventObject<TouchEvent>) => {
    this.lastDist = 0;
    this.lastCenter = null;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
    this.handleMouseUp(event);
  };

  private handleMouseMove = (event: any) => {
    if (this.props.panMode && !this.props.gameState.drawingArrow) {
      return false;
    }

    const pos = this.getRelativePositionFromTarget(event.currentTarget);
    if (this.props.gameState.drawingArrow) {
      this.props.updateDisconnectedArrowPosition({
        endPos: pos,
        myRef: myPeerRef,
      });
    } else if (this.state.selecting) {
      this.setState({
        drewASelectionRect: true,
        selectRect: {
          height: pos.y - this.state.selectStartPos.y,
          width: pos.x - this.state.selectStartPos.x,
        },
      });
    }
    event.cancelBubble = true;
  };

  private handleContextMenu = (
    event?: KonvaEventObject<PointerEvent> | KonvaEventObject<TouchEvent>,
    pos?: Vector2d
  ): void => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
    if (!!event) {
      event.evt.preventDefault();
      event.cancelBubble = true;
    }

    const menuItems: ContextMenuItem[] = [
      {
        label: "Undo",
        action: this.props.undo,
      },
      {
        label: "Redo",
        action: this.props.redo,
      },
      {
        label: "Load Deck by ID",
        action: () => {
          this.setState({
            showDeckImporter: true,
            deckImporterPosition: this.stage?.getPointerPosition() ?? {
              x: 0,
              y: 0,
            },
          });
        },
      },
      {
        label: `Search for Online Deck`,
        action: () => {
          this.props.showDeckSearch(
            this.stage?.getPointerPosition() || { x: 0, y: 0 }
          );
        },
      },
      // {
      //   label: "Load Deck from json file",
      //   fileLoadedAction: (jsonContents: string) => {
      //     this.props.createDeckFromJson({
      //       gameType: this.props.currentGameType,
      //       position: this.stage?.getPointerPosition() ?? { x: 0, y: 0 },
      //       jsonContents,
      //     });
      //   },
      //   fileUploader: true,
      // },
      {
        label: `Load ${
          GamePropertiesMap[this.props.currentGameType].encounterUiName
        }`,
        action: () => {
          this.setState({
            showEncounterImporter: true,
            encounterImporterPosition: this.stage?.getPointerPosition() ?? null,
          });
        },
      },
      {
        label: `Load Specific Card`,
        action: () => {
          this.props.showSpecificCardLoader(
            this.stage?.getPointerPosition() || { x: 0, y: 0 }
          );
        },
      },
      {
        label: "Create new counter",
        action: () => {
          this.props.addNewCounter(
            this.getRelativePositionFromTarget(this.stage) ?? { x: 0, y: 0 }
          );
        },
      },
      { label: "Remove all arrows", action: this.props.removeAllArrows },
      { label: "Reset Game", action: this.props.resetApp },
      {
        label: "Quit Game",
        action: () => {
          this.props.quitGame();
          this.props.resetApp();
          this.props.clearHistory();
        },
      },
      {
        label: "",
        labelHTML: "Multiplayer <span><b>(BETA)</b></span>",
        children: [
          {
            label: "Connect to online game",
            action: () => {
              this.setState({
                showPeerConnector: true,
                peerConnectorPosition: this.stage?.getPointerPosition() ?? null,
              });
            },
          },
          // {
          //   label: "Connect to Internet Game",
          //   action: () => {
          //     this.setState({
          //       showPeerConnector: true,
          //       peerConnectorPosition: this.stage?.getPointerPosition() ?? null,
          //     });
          //   },
          // },
          {
            label: "Request resync from Remote Game",
            action: this.props.requestResync,
          },

          {
            label: `Copy my online game link`,
            action: () => {
              if (!!this.props.peerId) {
                copyToClipboard(generateRemoteGameUrl(this.props.peerId));
              }
            },
          },
        ]
          .concat(
            !!this.props.peerId
              ? [
                  {
                    label: `Peer id is ${this.props.peerId} (click to copy)`,
                    action: () => {
                      if (!!this.props.peerId) {
                        copyToClipboard(this.props.peerId);
                      }
                    },
                  },
                ]
              : []
          )
          .concat(
            useWSLocalStorage
              ? [
                  {
                    label: `Start hosting a new online game`,
                    action: () => {
                      this.props.createNewMultiplayerGame();
                    },
                  },
                ]
              : []
          ),
      },
      {
        label: `Copy game to clipboard`,
        action: () => {
          this.props.generateGameStateUrl();
        },
      },
      {
        label: `Version _REPLACE_VERSION_`,
        action: () => {},
      },
    ];

    this.setState({
      showContextMenu: true,
      contextMenuPosition: pos ?? this.stage?.getPointerPosition() ?? null,
      contextMenuItems: menuItems,
    });
  };

  private getCardName = (card: ICardStack) => {
    const cardInQuestion = card.faceup
      ? card.cardStack[0]
      : card.cardStack[card.cardStack.length - 1];
    return this.props.cardsData[cardInQuestion.jsonId]?.name ?? "";
  };

  private getCardCode = (card: ICardStack) => {
    const cardInQuestion = card.faceup
      ? card.cardStack[0]
      : card.cardStack[card.cardStack.length - 1];

    if (!cardInQuestion) {
      log.error("Could not get card in question for stack:", card);
    }

    const idToGrab = cardInQuestion?.jsonId ?? "missing-id";

    return (
      this.props.cardsData[idToGrab]?.code ?? `code missing for ${idToGrab}`
    );
  };

  private handleResize = () => {
    this.setState({
      stageHeight: window.innerHeight - playerHandHeightPx,
      stageWidth: window.innerWidth,
    });
  };
}

export default Game;
