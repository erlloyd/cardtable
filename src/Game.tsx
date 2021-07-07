import * as Intersects from "intersects";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import * as React from "react";
import { Component } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { Provider, ReactReduxContext } from "react-redux";
import Card, { HORIZONTAL_TYPE_CODES } from "./Card";
import CardStackCardSelectorContainer from "./CardStackCardSelectorContainer";
import {
  GameType,
  myPeerRef,
  PlayerColor,
  possibleColors,
} from "./constants/app-constants";
import {
  CounterTokenType,
  StatusTokenType,
  cardConstants,
} from "./constants/card-constants";
import { MISSING_CARD_IMAGE_MAP } from "./constants/card-missing-image-map";
import { CARD_PACK_REMAPPING } from "./constants/card-pack-mapping";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import Counter from "./Counter";
import DeckLoader from "./DeckLoader";
import EncounterLoaderContainer from "./EncounterLoaderContainer";
import { CardData } from "./external-api/common-card-data";
import { ICardData } from "./features/cards-data/initialState";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import { ICardsState, ICardStack } from "./features/cards/initialState";
import { ICounter } from "./features/counters/initialState";
import { IGameState } from "./features/game/initialState";
import FirstPlayerTokenContainer from "./FirstPlayerTokenContainer";
import "./Game.scss";
import PeerConnector from "./PeerConnector";
import RadialMenuContainer from "./RadialMenuContainer";
import TokenValueModifier from "./TokenValueModifier";
import TopLayer from "./TopLayer";
import TouchMenuContainer from "./TouchMenuContainer";
import { getCenter, getDistance } from "./utilities/geo";
import { copyToClipboard, generateRemoteGameUrl } from "./utilities/text-utils";

const SCALE_BY = 1.02;

interface IProps {
  currentGameType: GameType;
  cards: ICardsState;
  cardsData: ICardData;
  gameState: IGameState;
  panMode: boolean;
  multiselectMode: boolean;
  playerColors: { [key: string]: PlayerColor };
  menuPreviewCard: ICardStack | null;
  cardMove: (info: { id: string; dx: number; dy: number }) => void;
  endCardMove: (id: string) => void;
  exhaustCard: (id?: string) => void;
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
  flipCards: () => void;
  loadCardsData: () => void;
  allJsonData: (payload: any) => void;
  shuffleStack: (id?: string) => void;
  fetchDecklistById: (payload: {
    gameType: GameType;
    decklistId: number;
    position: Vector2d;
  }) => void;
  updateZoom: (zoom: Vector2d) => void;
  updatePosition: (pos: Vector2d) => void;
  resetApp: () => void;
  addCardStack: (payload: {
    cardJsonIds: string[];
    position: Vector2d;
  }) => void;
  toggleToken: (payload: {
    id?: string;
    tokenType: StatusTokenType;
    value?: boolean;
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
  connectToRemoteGame: (peerId: string) => void;
  undo: () => void;
  redo: () => void;
  counters: ICounter[];
  requestResync: () => void;
  peerId: string;
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
  generateGameStateUrl: () => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
  adjustModifier: (payload: {
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }) => void;
  clearAllModifiers: (payload: { id?: string }) => void;
}

interface IState {
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
  public stage: Konva.Stage | null = null;

  private touchTimer: any = null;
  private doubleTapTimer: any = null;

  private lastCenter: Vector2d | null = null;
  private lastDist: number = 0;

  constructor(props: IProps) {
    super(props);

    if (!!Konva) {
      Konva.hitOnDragEnabled = true;
    }

    this.state = {
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
      stageHeight: window.innerHeight,
    };
  }

  public componentDidMount() {
    const image = new Image();
    image.onload = () => {
      this.setState({
        playmatImage: image,
        playmatImageLoaded: true,
      });
    };

    image.onerror = (e) => {
      console.error(e);
    };
    image.src =
      GamePropertiesMap[this.props.currentGameType].backgroundImageLocation;
    this.props.loadCardsData();
    this.props.allJsonData("");

    window.addEventListener("resize", this.handleResize);
  }

  public componentWillUnmount = () => {
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
    if (document.activeElement === document.body) {
      // setTimeout so we don't manually change the dom while rendering
      setTimeout(() => {
        const el = document.querySelector(".play-area") as HTMLElement;
        el?.focus();
      }, 0);
    }
    // END HACK

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
            handleDragEnd={this.props.endCardMove}
            handleDoubleClick={this.handleSelectAndExhaust}
            handleDoubleTap={this.showOrToggleModalPreviewCard}
            handleClick={this.handleCardClick(card)}
            handleHover={this.props.setPreviewCardId}
            handleHoverLeave={this.props.clearPreviewCard}
            handleContextMenu={this.handleCardContextMenu}
            imgUrls={this.getImgUrls(card)}
            typeCode={this.getCardType(card)}
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
          imgUrls={this.getImgUrls(card)}
          typeCode={this.getCardType(card)}
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
            handleDragEnd={this.props.endCardMove}
            imgUrls={this.getImgUrls(card)}
            typeCode={this.getCardType(card)}
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
              this.getCardType(card)
            );
            const imgUrls = this.getImgUrls(card);
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
                typeCode={this.getCardType(card)}
                faceup={card.faceup}
                height={previewCardHeight / this.props.gameState.stageZoom.y}
                width={previewCardWidth / this.props.gameState.stageZoom.x}
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
        tabIndex={1}
        onKeyDown={this.handleKeyDown}
        onKeyPress={this.handleKeyPress}
      >
        <RadialMenuContainer></RadialMenuContainer>
        {this.renderEmptyMessage()}
        {this.renderContextMenu()}
        {this.renderPreviewCardModal()}
        {this.renderTouchMenu()}
        {this.renderDeckImporter()}
        {this.renderEncounterImporter()}
        {this.renderCardSearch()}
        {this.renderPeerConnector()}
        {this.renderTokenModifier()}

        <ReactReduxContext.Consumer>
          {({ store }) => (
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
              onMouseDown={
                this.props.panMode ? this.noOp : this.handleMouseDown
              }
              onMouseUp={this.props.panMode ? this.noOp : this.handleMouseUp}
              onMouseMove={
                this.props.panMode ? this.noOp : this.handleMouseMove
              }
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
                  <Rect
                    fill={
                      this.state.playmatImageLoaded ? undefined : "lightgray"
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
                      this.state.playmatImageLoaded && !!this.state.playmatImage
                        ? this.state.playmatImage
                        : undefined
                    }
                  ></Rect>
                </Layer>
                <Layer>
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
                </Layer>
                <Layer preventDefault={true}>
                  {ghostCards.concat(staticCards).concat(movingCards)}

                  <FirstPlayerTokenContainer
                    currentGameType={this.props.currentGameType}
                  ></FirstPlayerTokenContainer>

                  {previewCards}
                </Layer>
                <Layer>
                  <Rect
                    x={this.state.selectStartPos.x}
                    y={this.state.selectStartPos.y}
                    width={this.state.selectRect.width}
                    height={this.state.selectRect.height}
                    stroke="yellow"
                    strokeWidth={4}
                  />
                </Layer>
              </Provider>
            </Stage>
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
    if (this.props.cards.cards.length > 0) return null;

    return (
      <div>
        <span>
          Right click and select 'Load Deck ID' to load a deck from{" "}
          {GamePropertiesMap[this.props.currentGameType].deckSite}
        </span>
      </div>
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

  private renderTouchMenu = () => {
    if (this.props.cards.cards.length === 0) return null;
    return <TouchMenuContainer></TouchMenuContainer>;
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
          x: position.x + (cardConstants.CARD_WIDTH + 10) * index,
          y: position.y,
        },
        cardJsonIds: c,
      });
    });
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
    const currentStatusTokens = card?.statusTokens || {
      stunned: false,
      confused: false,
      tough: false,
    };

    const menuItems: ContextMenuItem[] = [
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

    const tokenInfoForGameType =
      GamePropertiesMap[this.props.currentGameType].tokens;

    if (!!tokenInfoForGameType.stunned) {
      menuItems.push({
        label: !!currentStatusTokens.stunned
          ? tokenInfoForGameType.stunned.menuRemoveText
          : tokenInfoForGameType.stunned.menuText,
        action: () => {
          this.props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Stunned,
            value: !currentStatusTokens.stunned,
          });
        },
      });
    }

    if (!!tokenInfoForGameType.confused) {
      menuItems.push({
        label: !!currentStatusTokens.confused
          ? tokenInfoForGameType.confused.menuRemoveText
          : tokenInfoForGameType.confused.menuText,
        action: () => {
          this.props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Confused,
            value: !currentStatusTokens.confused,
          });
        },
      });
    }

    if (!!tokenInfoForGameType.tough) {
      menuItems.push({
        label: !!currentStatusTokens.tough
          ? tokenInfoForGameType.tough.menuRemoveText
          : tokenInfoForGameType.tough.menuText,
        action: () => {
          this.props.toggleToken({
            id: card?.id || "",
            tokenType: StatusTokenType.Tough,
            value: !currentStatusTokens.tough,
          });
        },
      });
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

    if (modifiersForGameType.length > 0) {
      menuItems.push({
        label: "Modifiers",
        children: modifiersForGameType
          .map((m) => {
            return {
              label: m.attributeName,
              children: [
                {
                  label: "+1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      delta: 1,
                    });
                  },
                },
                {
                  label: "- 1",
                  action: () => {
                    this.props.adjustModifier({
                      id: card?.id || "",
                      modifierId: m.attributeId,
                      delta: -1,
                    });
                  },
                },
              ],
            } as ContextMenuItem;
          })
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
      event: KonvaEventObject<MouseEvent>,
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
        if (distance < 50) {
          splitTopCard = true;
        }
      }
    }

    this.props.startCardMove({ id: cardId, splitTopCard });
  };

  private handleKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    const modifier: boolean = event.ctrlKey || event.metaKey;
    const code = event.key.toLocaleLowerCase();
    const intCode = parseInt(code);
    if (code === "p") {
      this.props.togglePanMode();
    } else if (code === "f") {
      this.props.flipCards();
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
        const mySelectedCards = this.props.cards.cards.filter(
          (c) => c.selected && c.controlledBy === myPeerRef
        );
        if (mySelectedCards.length !== 1) {
          console.log(
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

  private handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const code = event.key.toLocaleLowerCase();
    const intCode = parseInt(code);

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

    return pointerPos.x < screenMidPointX
      ? {
          x: window.innerWidth - widthToUse / 2,
          y: heightToUse / 2,
        }
      : {
          x: widthToUse / 2,
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
    return transform.point(pos) as Vector2d;
  };

  private handleMouseDown = (
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>
  ) => {
    if (
      (event.evt instanceof MouseEvent && event.evt.button === 0) ||
      event.evt instanceof TouchEvent
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

    if (!this.props.panMode) {
      this.handleMouseDown(event);
    }
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

    if (!this.props.panMode) {
      this.handleMouseUp(event);
    }
  };

  private handleMouseMove = (event: any) => {
    if (this.state.selecting) {
      const pos = this.getRelativePositionFromTarget(event.currentTarget);
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
    event: KonvaEventObject<PointerEvent> | KonvaEventObject<TouchEvent>
  ): void => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
    event.evt.preventDefault();
    event.cancelBubble = true;

    const menuItems = [
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
            deckImporterPosition: this.stage?.getPointerPosition() ?? null,
          });
        },
      },
      {
        label: "Load Deck from txt file",
        fileLoadedAction: (txtContents: string) => {
          this.props.createDeckFromTxt({
            gameType: this.props.currentGameType,
            position: this.stage?.getPointerPosition() ?? { x: 0, y: 0 },
            txtContents,
          });
        },
        fileUploader: true,
      },
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
        label: "Create new counter",
        action: () => {
          this.props.addNewCounter(
            this.getRelativePositionFromTarget(this.stage) ?? { x: 0, y: 0 }
          );
        },
      },
      { label: "Reset Game", action: this.props.resetApp },
      {
        label: "Quit Game",
        action: () => {
          this.props.quitGame();
          this.props.resetApp();
        },
      },
      {
        label: "Connect to Remote Game",
        action: () => {
          this.setState({
            showPeerConnector: true,
            peerConnectorPosition: this.stage?.getPointerPosition() ?? null,
          });
        },
      },
      {
        label: "Request resync from Remote Game",
        action: this.props.requestResync,
      },
      {
        label: `Peer id is ${this.props.peerId}`,
        action: () => {
          if (!!this.props.peerId) {
            copyToClipboard(generateRemoteGameUrl(this.props.peerId));
          }
        },
      },
      {
        label: `Copy game state as url`,
        action: () => {
          this.props.generateGameStateUrl();
        },
      },
    ];

    this.setState({
      showContextMenu: true,
      contextMenuPosition: this.stage?.getPointerPosition() ?? null,
      contextMenuItems: menuItems,
    });
  };

  private getCardType = (card: ICardStack): string => {
    if (Object.keys(this.props.cardsData).length === 0) return "";

    const cardData = this.props.cardsData[card.cardStack[0].jsonId];

    return (cardData?.typeCode ?? "").toLocaleLowerCase();
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
      console.error("Could not get card in question for stack:", card);
    }

    const idToGrab = cardInQuestion?.jsonId ?? "missing-id";

    return (
      this.props.cardsData[idToGrab]?.code ?? `code missing for ${idToGrab}`
    );
  };

  private checkMissingImageMap(code: string): string | null {
    return MISSING_CARD_IMAGE_MAP[code] ?? null;
  }

  private generateLCGCDNImageUrl(card: CardData, faceup: boolean): string {
    if (!card) {
      return `https://lcgcdn.s3.amazonaws.com/mc/NOPE.jpg`;
    }

    // get the first two digits
    let codeToUse = card.code;

    if (!faceup && !!card.backLink) {
      codeToUse = card.backLink;
    }

    const groupCode =
      CARD_PACK_REMAPPING[card.extraInfo.packCode ?? ""] ??
      codeToUse.substring(0, 2);
    let cardCode = codeToUse.substring(2);

    //trim leading "0" chars
    while (cardCode[0] === "0") {
      cardCode = cardCode.substring(1);
    }

    cardCode = cardCode.toLocaleUpperCase();

    let cardSuffix = "";

    if (!!card.doubleSided) {
      cardSuffix = faceup ? "A" : "B";
    }

    return `https://lcgcdn.s3.amazonaws.com/mc/MC${groupCode}en_${cardCode}${cardSuffix}.jpg`;
  }

  private getImgUrls = (card: ICardStack): string[] => {
    if (Object.keys(this.props.cardsData).length === 0) return [];

    let urls: string[] = [];

    const topCardData = this.props.cardsData[card.cardStack[0].jsonId];

    if (!topCardData) {
      return [];
    }

    let cardData: CardData | null = topCardData;

    if (!!cardData.images) {
      if (!card.faceup) {
        if (!cardData.images.back) {
          return [
            topCardData.extraInfo.factionCode === "encounter"
              ? process.env.PUBLIC_URL +
                "/images/standard/encounter_card_back_" +
                this.props.currentGameType +
                ".png"
              : process.env.PUBLIC_URL +
                "/images/standard/card_back_" +
                this.props.currentGameType +
                ".png",
          ];
        } else {
          return [cardData.images.back];
        }
      } else {
        return [cardData.images.front];
      }
    }

    if (!card.faceup) {
      if (!!topCardData.backLink || !!topCardData.doubleSided) {
        urls = [
          this.generateLCGCDNImageUrl(topCardData, card.faceup),
          // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.png`,
          // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.jpg`,
          // process.env.PUBLIC_URL +
          //   "/images/cards/" +
          //   bottomCardData.octgn_id +
          //   ".b.jpg",
        ];
      } else {
        cardData = null;
        urls = [
          topCardData.extraInfo.factionCode === "encounter"
            ? process.env.PUBLIC_URL +
              "/images/standard/encounter_card_back_" +
              this.props.currentGameType +
              ".png"
            : process.env.PUBLIC_URL +
              "/images/standard/card_back_" +
              this.props.currentGameType +
              ".png",
        ];
      }
    } else {
      urls = [
        this.generateLCGCDNImageUrl(topCardData, card.faceup),
        // `https://marvelcdb.com/bundles/cards/${topCardData.code}.png`,
        // `https://marvelcdb.com/bundles/cards/${topCardData.code}.jpg`,
        // process.env.PUBLIC_URL +
        //   "/images/cards/" +
        //   topCardData.octgn_id +
        //   ".jpg",
      ];
    }

    let codeForMissingCheck = "";

    if (!!cardData) {
      if (card.faceup) {
        codeForMissingCheck = cardData.code;
      } else {
        if (!!cardData.backLink) {
          codeForMissingCheck = cardData.backLink;
        } else if (cardData.doubleSided) {
          codeForMissingCheck = `${cardData.code}_double_sided_back`;
        }
      }
    }

    const missingImageOverride = !!cardData
      ? this.checkMissingImageMap(codeForMissingCheck)
      : null;

    if (!!missingImageOverride) {
      urls.unshift(missingImageOverride);
    }

    return urls;
  };

  private handleResize = () => {
    this.setState({
      stageHeight: window.innerHeight,
      stageWidth: window.innerWidth,
    });
  };
}

export default Game;
