import CloseIcon from "@material-ui/icons/Close";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { IconButton, Snackbar } from "@mui/material";
import { H } from "highlight.run";
import * as Intersects from "intersects";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import log from "loglevel";
import { ConfirmOptions, useConfirm } from "material-ui-confirm";
import React, { Component } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import Card from "./Card";
import CardPeekContainer from "./CardPeekContainer";
import CardStackCardSelectorContainer from "./CardStackCardSelectorContainer";
import CardtableAlertsContainer from "./CardtableAlertsContainer";
import ChangelogContainer from "./ChangelogContainer";
import ContextualOptionsMenuContainer from "./ContextualOptionsMenuContainer";
import Counter from "./Counter";
import CurvedArrowsContainer from "./CurvedArrowsContainer";
import DeckLoader from "./DeckLoader";
import DeckSearchContainer from "./DeckSearchContainer";
import DeckTextImporterContainer from "./DeckTextImporterContainer";
import EncounterLoaderContainer from "./EncounterLoaderContainer";
import FirstPlayerTokenContainer from "./FirstPlayerTokenContainer";
import FlippableToken from "./FlippableToken";
import "./Game.scss";
import GameContextMenuContainer from "./GameContextMenuContainer";
import NotesContainer from "./NotesContainer";
import OptionsMenuContainer from "./OptionsMenuContainer";
import PeerConnector from "./PeerConnector";
import PlayerBoardsContainer from "./PlayerBoardsContainer";
import PlayerHandContainer from "./PlayerHandContainer";
import PlaymatGroupContainer from "./PlaymatGroupContainer";
import RemoteUndoOverlayContainer from "./RemoteUndoOverlayContainer";
import SpecificCardLoaderContainer from "./SpecificCardLoaderContainer";
import TokenBagsContainer from "./TokenBagsContainer";
import TokenValueModifier from "./TokenValueModifier";
import TopLayer from "./TopLayer";
import {
  COLORS,
  PlayerColor,
  myPeerRef,
  playerHandHeightPx,
} from "./constants/app-constants";
import {
  CardSizeType,
  CounterTokenType,
  StatusTokenType,
  cardConstants,
  tokenConstants,
} from "./constants/card-constants";
import { CARD_SHOULD_BE_HORIZONTAL_MAP } from "./constants/card-missing-image-map";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { CardData } from "./external-api/common-card-data";
import { ICardData } from "./features/cards-data/initialState";
import { DrawCardsOutOfCardStackPayload } from "./features/cards/cards.thunks";
import {
  ICardStack,
  ICardsState,
  IDropTarget,
  IPlayerBoard,
  IPlayerBoardSlotLocation,
} from "./features/cards/initialState";
import { ICounter, IFlippableToken } from "./features/counters/initialState";
import { IGameState } from "./features/game/initialState";
import GameManager from "./game-modules/GameModuleManager";
import { GameType } from "./game-modules/GameType";
import {
  cacheImages,
  getCardType,
  getImgUrls,
  getImgUrlsFromJsonId,
  getMySelectedCards,
} from "./utilities/card-utils";
import { getCenter, getDistance } from "./utilities/geo";
import TokenBagMenuContainer from "./TokenBagMenuContainer";
import TokenEditorContainer from "./TokenEditorContainer";

const SCALE_BY = 1.02;

// Wrapper for hook stuff
const withConfirm = (Component: any) => {
  return function WrappedComponent(props: IProps) {
    const confirm = useConfirm();
    return <Component {...props} confirm={confirm} />;
  };
};
interface IProps {
  confirm?: (options?: ConfirmOptions) => Promise<void>;
  currentGameType: GameType;
  currentPlayerRole: string | null;
  cards: ICardsState;
  cardsData: ICardData;
  gameState: IGameState;
  panMode: boolean;
  multiselectMode: boolean;
  playerColors: { [key: string]: PlayerColor };
  playerNumbers: { [key: string]: number };
  menuPreviewCard: { card: ICardStack; modal: boolean } | null;
  isDoneLoadingJSONData: boolean;
  cardMove: (info: {
    id: string;
    dx: number;
    abs_x?: number;
    dy: number;
    abs_y?: number;
  }) => void;
  endCardMove: (id: string) => void;
  cardFromHandMove: (pos: Vector2d, sizeType: CardSizeType) => void;
  exhaustAllCards: (id?: string) => void;
  deleteCardStack: (id?: string) => void;
  selectCard: (payload: { id: string; unselectOtherCards: boolean }) => void;
  unselectCard: (id: string) => void;
  toggleSelectCard: (id: string) => void;
  startCardMove: (payload: { id: string; splitTopCard: boolean }) => void;
  unselectAllCards: (payload?: any) => void;
  unselectAllTokens: (payload?: any) => void;
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
  loadCardsData: (gameType: GameType) => void;
  allJsonData: (payload: GameType) => void;
  spawnTokenBags: (payload: GameType) => void;
  allCustomData: (payload: GameType) => void;
  shuffleStack: (id?: string) => void;
  fetchDecklistById: any;
  // fetchDecklistById: (payload: {
  //   gameType: GameType;
  //   decklistId: number;
  //   usePrivateApi: boolean;
  //   position: Vector2d;
  // }) => void;
  updateZoom: (zoom: Vector2d) => void;
  updatePosition: (pos: Vector2d) => void;
  resetApp: (currentGameType: GameType) => void;
  addCardStack: (payload: {
    cardJsonIds: string[];
    position: Vector2d;
    faceup?: boolean;
  }) => void;
  addCardStackToPlayerBoardSlot: (payload: {
    cardJsonIds: string[];
    slot: IPlayerBoardSlotLocation;
  }) => void;
  addToExistingCardStack: (payload: {
    existingStackId: string;
    cardJsonIds: string[];
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
  addNewCounter: (
    pos: Vector2d,
    imgurl?: string,
    text?: string,
    color?: PlayerColor
  ) => void;
  updateCounterValue: (payload: { id: string; delta: number }) => void;
  moveCounter: (payload: { id: string; newPos: Vector2d }) => void;
  connectToRemoteGame: (peerId: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  counters: ICounter[];
  tokens: IFlippableToken[];
  peerId: string;
  multiplayerGameName: string;
  dropTargetCardsById: {
    [key: string]: { ownerRef: string; card: IDropTarget | null };
  };
  drawCardsOutOfCardStack: (payload: DrawCardsOutOfCardStackPayload) => void;
  quitGame: () => void;
  createDeckFromTxt: (payload: {
    gameType: GameType;
    position: Vector2d;
    txtContents: string;
  }) => void;
  showRadialMenuAtPosition: (payload: Vector2d) => void;
  addToPlayerHandWithRoleCheck: (payload: { playerNumber: number }) => void;
  clearMyGhostCards: () => void;
  setDrawingArrow: (val: boolean) => void;
  startNewArrow: (startCardId: string) => void;
  endDisconnectedArrow: (payload: { endCardId: string; myRef: string }) => void;
  updateDisconnectedArrowPosition: (payload: {
    endPos: Vector2d;
    myRef: string;
  }) => void;
  removeAnyDisconnectedArrows: (myRef: string) => void;
  createNewTokens: (tokens: IFlippableToken[]) => void;
  createNewPlayerBoards: (playerBoards: IPlayerBoard[]) => void;
  handleTokenEndMove: (payload: { id: string; pos: Vector2d }) => void;
  flipToken: (id: string) => void;
  rotatePreviewCard180: boolean;
  togglePreviewCardRotation: () => void;
  initBoardSlots: () => void;
  handleTokenSelect: (payload: {
    ids: string[];
    forceSelected?: boolean;
    forceMultiSelectMode?: boolean;
  }) => void;
  handleTokenMove: (info: {
    id: string;
    dx: number;
    abs_x?: number;
    dy: number;
    abs_y?: number;
  }) => void;
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
  contextMenuCard: ICardStack | null;
  contextMenuCounterId: string | null;
  showDeckImporter: boolean;
  deckImporterPosition: Vector2d | null;
  showEncounterImporter: boolean;
  encounterImporterPosition: Vector2d | null;
  importerForCustomCards: boolean;
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
  forcePan: boolean;
}
class Game extends Component<IProps, IState> {
  static whyDidYouRender = false;
  public isSetUp = false;

  public stage: Konva.Stage | null = null;

  private touchTimer: any = null;
  private doubleTapTimer: any = null;

  private lastCenter: Vector2d | null = null;
  private lastDist: number = 0;

  private lastMousePos: Vector2d = { x: 0, y: 0 };
  private captureLastMousePos = true;

  private resizeObserver: ResizeObserver | null = null;

  private canvasEl: HTMLCanvasElement | null = null;

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
      contextMenuCard: null,
      contextMenuCounterId: null,
      showDeckImporter: false,
      deckImporterPosition: null,
      showEncounterImporter: false,
      importerForCustomCards: false,
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
      stageHeight: window.innerHeight,
      forcePan: false,
    };
  }

  get panMode(): boolean {
    return this.props.panMode || this.state.forcePan;
  }

  public componentDidMount() {
    if (!GamePropertiesMap[this.props.currentGameType]) {
      this.props.resetApp(this.props.currentGameType);
      this.props.quitGame();
      this.props.clearHistory();
      return null;
    }

    if (!this.isSetUp) {
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
      document.addEventListener("keypress", this.handleKeyPress);

      // Commented out as part of fixing issue with orientation change on android on 3/1/2024
      // window.addEventListener("resize", this.handleResize);
      // window.addEventListener("orientationchange", this.handleResize);

      // This is being used instead of the preious approach of listening to document level resize and orientation change
      // events. For some reason, responding to those events and using `window.innerHeight` or `window.innerWidth` in any
      // code in that event causes a bug if you set a Konva stage width or height based on it. On some devices (android
      // primarily) after a few rotations the window dimensions would be x4 bigger (so maybe an "ultra-hd" issue?). In any
      // case, using a resizeObserver combined with rerendering when a change occurs (which happens because of the call to
      // setState in the callback) Everything appears to be working
      this.resizeObserver = new ResizeObserver((entries) => {
        if (entries.length !== 1) {
          console.error(
            `Got unexpected number of resized entries (expected 1, got ${entries.length}`
          );
          return;
        }

        this.setState({
          stageHeight: entries[0].contentRect.height,
          stageWidth: entries[0].contentRect.width,
        });
      });

      // Observe the play area
      const pa = document.querySelector(".play-area");
      if (pa) {
        this.resizeObserver.observe(pa);
      } else {
        console.error(
          "Couldn't find .play-area to observe. Resizing will not work."
        );
      }

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
        GamePropertiesMap[this.props.currentGameType]
          .initialPlaymatImageLocation ||
        "/images/table/background_default.jpg";

      // Right now this is the best way to tell if we are loading a standard module
      // or a custom module
      if (Object.values(GameType).includes(this.props.currentGameType)) {
        this.props.loadCardsData(this.props.currentGameType);
        this.props.allJsonData(this.props.currentGameType);
        this.props.spawnTokenBags(this.props.currentGameType);
      } else {
        // we still want to load custom data if there is any (there should be...)
        this.props.allCustomData(this.props.currentGameType);
      }
      // Make sure the table slots are loaded for all playmats
      this.props.initBoardSlots();

      this.isSetUp = true;
    }
  }

  public componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keypress", this.handleKeyPress);

    // Commented out as part of fixing issue with orientation change on android on 3/1/2024
    // window.removeEventListener("resize", this.handleResize);
  };

  public render() {
    if (!GamePropertiesMap[this.props.currentGameType]) {
      return null;
    }

    // try manual snapshotting
    if (import.meta.env.MODE === "production" && !!this.canvasEl) {
      H.snapshot(this.canvasEl);
    }

    // alert(`STAGE DIM: ${this.state.stageHeight} x ${this.state.stageWidth}`);

    const staticCards = this.props.cards.cards
      .filter((card) => !card.dragging)
      .map((card) => {
        return (
          <Card
            currentGameType={this.props.currentGameType}
            currentPlayerRole={this.props.currentPlayerRole}
            code={this.getCardCode(card)}
            backLinkCode={this.getCardCode(card, true)}
            name={this.getCardName(card)}
            selectedColor={
              this.props.playerColors[card.controlledBy] ?? COLORS.BLACK
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
            sizeType={card.sizeType}
          />
        );
      });

    const ghostCards = this.props.cards.ghostCards.map((card) => {
      return (
        <Card
          currentGameType={this.props.currentGameType}
          currentPlayerRole={this.props.currentPlayerRole}
          name={this.getCardName(card)}
          code={this.getCardCode(card)}
          backLinkCode={this.getCardCode(card, true)}
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
          sizeType={card.sizeType}
        />
      );
    });

    const movingCards = this.props.cards.cards
      .filter((card) => card.dragging)
      .map((card) => {
        return (
          <Card
            currentGameType={this.props.currentGameType}
            currentPlayerRole={this.props.currentPlayerRole}
            name={this.getCardName(card)}
            code={this.getCardCode(card)}
            backLinkCode={this.getCardCode(card, true)}
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
            sizeType={card.sizeType}
          />
        );
      });

    const iAmDragging = this.props.cards.cards.some(
      (c) => c.dragging && c.controlledBy === myPeerRef
    );

    const possiblePreviewCards = !!this.props.menuPreviewCard
      ? [this.props.menuPreviewCard.card]
      : this.props.cards.cards.filter(
          (card) =>
            !!this.props.gameState.previewCard &&
            card.id === this.props.gameState.previewCard.id
        );

    const previewCardsMetadata = possiblePreviewCards
      .filter((_card) => !this.state.selecting && !iAmDragging)
      .map((card) => {
        let isHorizontal =
          CARD_SHOULD_BE_HORIZONTAL_MAP[this.getCardCode(card)] ||
          GameManager.horizontalCardTypes[this.props.currentGameType].includes(
            getCardType(card, this.props.cardsData)
          );

        if (
          !!this.props.currentGameType &&
          GameManager.getModuleForType(this.props.currentGameType)
            .shouldRotateCard
        ) {
          isHorizontal = GameManager.getModuleForType(
            this.props.currentGameType
          ).shouldRotateCard!(
            this.getCardCode(card),
            getCardType(card, this.props.cardsData),
            card.faceup
          );
        }

        const imgUrls = getImgUrls(
          card,
          this.props.cardsData,
          this.props.currentGameType
        );
        const rawPos = this.getRawPreviewCardPosition(
          isHorizontal,
          card.sizeType
        );
        const previewPos = this.getRelativePositionFromTarget(
          this.stage,
          rawPos
        );

        let previewCardHeight =
          cardConstants[card.sizeType].CARD_PREVIEW_HEIGHT;
        let previewCardWidth = cardConstants[card.sizeType].CARD_PREVIEW_WIDTH;

        // if height or width are zero, don't display the card
        if (previewCardHeight === 0 || previewCardWidth === 0) {
          return null;
        }

        // Note that we only adjust the height, because the card will
        // be rotated if it supposed to be displayed horizontally
        previewCardHeight = Math.min(
          cardConstants[card.sizeType].CARD_PREVIEW_HEIGHT,
          isHorizontal ? window.innerWidth : window.innerHeight
        );
        const previewCardRatio =
          previewCardHeight / cardConstants[card.sizeType].CARD_PREVIEW_HEIGHT;
        previewCardWidth *= previewCardRatio;

        if (imgUrls.some((url) => url === undefined)) {
          console.warn(`Card img is undefined for ${this.getCardName(card)}`);
          return null;
        }

        return imgUrls.some((url) =>
          GameManager.getModuleForType(
            this.props.currentGameType
          ).isCardBackImg(url)
        )
          ? null
          : {
              name: this.getCardName(card),
              code: this.getCardCode(card),
              backLinkCode: this.getCardCode(card, true),
              selectedColor:
                this.props.playerColors[card.controlledBy] ?? "black",
              controlledBy: card.controlledBy,
              key: `preview${card.id}`,
              id: card.id,
              x: previewPos.x,
              y: previewPos.y,
              exhausted: isHorizontal,
              fill: card.fill,
              imgUrls,
              typeCode: getCardType(card, this.props.cardsData),
              faceup: card.faceup,
              height: previewCardHeight / this.props.gameState.stageZoom.y,
              width: previewCardWidth / this.props.gameState.stageZoom.x,
              sizeType: card.sizeType,
            };
      })
      .filter((c) => c !== null);

    const previewCards =
      this.stage &&
      !this.state.previewCardModal &&
      !this.props.gameState.menuPreviewCardModal
        ? previewCardsMetadata.map((cardInfo) => (
            <Card
              currentGameType={this.props.currentGameType}
              currentPlayerRole={this.props.currentPlayerRole}
              name={cardInfo.name}
              code={cardInfo.code}
              backLinkCode={cardInfo.backLinkCode}
              selectedColor={cardInfo.selectedColor}
              controlledBy={cardInfo.controlledBy}
              key={cardInfo.key}
              id={cardInfo.id}
              x={cardInfo.x}
              y={cardInfo.y}
              exhausted={cardInfo.exhausted}
              fill={cardInfo.fill}
              selected={false}
              dragging={false}
              shuffling={false}
              imgUrls={cardInfo.imgUrls}
              typeCode={cardInfo.typeCode}
              faceup={cardInfo.faceup}
              height={cardInfo.height}
              width={cardInfo.width}
              isPreview={true}
              sizeType={cardInfo.sizeType}
              additionalRotation={this.props.rotatePreviewCard180 ? 180 : 0}
            />
          ))
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
                ),
                CardSizeType.Standard //TODO: Figure this out from metadata?
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
              this.getRelativePositionFromTarget(this.stage, this.lastMousePos),
              CardSizeType.Standard //TODO: Figure this out from metadata?
            );
          }
        }}
      >
        <PlayerHandContainer
          playerNumber={this.props.playerNumbers[myPeerRef] ?? 1}
          droppedBackInHand={this.handleDroppedBackInHand}
          droppedOnTable={this.handleDroppedOnTable}
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
        <DeckTextImporterContainer></DeckTextImporterContainer>
        <NotesContainer></NotesContainer>
        <CardPeekContainer></CardPeekContainer>
        <TokenEditorContainer></TokenEditorContainer>
        <ChangelogContainer></ChangelogContainer>
        {this.renderEmptyMessage()}
        {this.renderContextMenu()}
        {this.renderPreviewCardModal(
          previewCardsMetadata.map((m) => m.imgUrls)
        )}
        {this.renderOptionsMenu()}
        {this.renderContextualOptionsMenu()}
        {this.renderDeckImporter()}
        {this.renderEncounterImporter()}
        {this.renderCardSearch()}
        {this.renderPeerConnector()}
        {this.renderTokenModifier()}
        <TokenBagMenuContainer />

        {/* Game loader input (hidden) */}

        {/* <ReactReduxContext.Consumer>
          {({ store }) => ( */}
        <div
          ref={(el) => {
            const canvas = el?.querySelector("canvas");
            if (!!canvas) {
              this.canvasEl = canvas;
            }
          }}
        >
          {/* <Provider store={store}> */}
          <CardtableAlertsContainer></CardtableAlertsContainer>
          {/* </Provider> */}
          <RemoteUndoOverlayContainer />
          <Stage
            ref={(ref) => {
              if (!ref) return;

              this.stage = ref;
            }}
            x={this.props.gameState.stagePosition.x}
            y={this.props.gameState.stagePosition.y}
            width={this.state.stageWidth}
            height={this.state.stageHeight - playerHandHeightPx}
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
            draggable={this.panMode}
            onDragMove={this.noOp}
            onDragEnd={this.noOp}
            preventDefault={true}
          >
            {/* <Provider store={store}> */}
            <Layer>
              <PlaymatGroupContainer />
              <PlayerBoardsContainer />
              <TokenBagsContainer />
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
                    counterImageUrl={counter.imgUrl}
                    counterText={counter.text}
                  ></Counter>
                ))}
              </Group>
              <Group preventDefault={true}>
                {ghostCards.concat(staticCards).concat(movingCards)}

                <FirstPlayerTokenContainer
                  currentGameType={this.props.currentGameType}
                ></FirstPlayerTokenContainer>
                <Group>
                  {this.props.tokens.map((token) => (
                    <FlippableToken
                      key={`${token.id}-token`}
                      currentGameType={this.props.currentGameType}
                      id={token.id}
                      imgUrl={token.imgUrl}
                      backImgUrl={token.backImgUrl}
                      pos={token.position}
                      faceup={token.faceup}
                      controlledBy={token.controlledBy}
                      selectedColor={
                        this.props.playerColors[token.controlledBy ?? ""] ??
                        COLORS.BLACK
                      }
                      handleTokenEndMove={this.props.handleTokenEndMove}
                      flipToken={this.props.flipToken}
                      handleTokenSelect={this.props.handleTokenSelect}
                      handleTokenMove={this.props.handleTokenMove}
                    ></FlippableToken>
                  ))}
                </Group>
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
            {/* </Provider> */}
          </Stage>
        </div>
        {/* )} */}
        {/* </ReactReduxContext.Consumer> */}
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
        <div className="icon-button">
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </React.Fragment>
    );

    const message = (
      <React.Fragment>
        <div className="snack-text">
          <span>Use the</span>
          <MoreVertIcon fontSize="small" />
          <span>button to load a deck or scenario</span>
        </div>
      </React.Fragment>
    );

    return (
      <Snackbar
        className="empty-message-snackbar"
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

  private handleCounterTokenModification = (
    card: ICardStack,
    type: CounterTokenType
  ) => {
    this.setState({
      showContextMenu: false,
      contextMenuPosition: null,
      contextMenuCard: null,
      contextMenuCounterId: null,

      showTokenValueModifier: true,
      tokenValueModifierProps: {
        id: card.id || "",
        tokenType: type,
      },
      tokenValueModifierPosition: this.stage?.getPointerPosition() ?? null,
    });
  };

  private handleImportDeckFromMenu = () => {
    const pointerPosition = this.stage?.getPointerPosition() ?? { x: 0, y: 0 };

    this.setState({
      showDeckImporter: true,
      deckImporterPosition: pointerPosition,
    });
  };

  private handleFindSpecificCard = (card: ICardStack) => {
    const pointerPosition = this.stage?.getPointerPosition() ?? null;
    this.setState({
      showCardSearch: true,
      cardSearchPosition: pointerPosition ?? null,
      cardStackForSearching: card,
    });
  };

  private handleShowEncounterLoader = (custom: boolean) => {
    const pointerPosition = this.stage?.getPointerPosition() ?? null;
    this.setState({
      showEncounterImporter: true,
      importerForCustomCards: custom,
      encounterImporterPosition: pointerPosition,
    });
  };

  private handleConnectToOnlineGame = () => {
    const pointerPosition = this.stage?.getPointerPosition() ?? null;
    this.setState({
      showPeerConnector: true,
      peerConnectorPosition: pointerPosition,
    });
  };

  private renderContextMenu = () => {
    if (!this.state.showContextMenu) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPositionForMenu = this.state.contextMenuPosition ?? {
      x: 0,
      y: 0,
    };
    if (!containerRect || !pointerPositionForMenu) {
      throw new Error("Problem computing context menu position");
    }

    const card =
      this.props.cards.cards.find(
        (c) => c.id === (this.state.contextMenuCard?.id || "missing")
      ) ?? null;
    const mySelectedCards = getMySelectedCards(this.props.cards.cards);

    const counter =
      this.props.counters.find(
        (c) => c.id === (this.state.contextMenuCounterId ?? "no-counter-id")
      ) ?? null;

    const pointerPosition = this.stage?.getPointerPosition() ?? null;

    return (
      <GameContextMenuContainer
        confirm={this.props.confirm}
        position={{
          x: containerRect.left + pointerPositionForMenu.x,
          y: Math.max(containerRect.top, 0) + pointerPositionForMenu.y,
        }}
        pointerPosition={pointerPosition}
        relativePosition={
          this.getRelativePositionFromTarget(this.stage) ?? {
            x: 0,
            y: 0,
          }
        }
        card={card}
        counter={counter}
        mySelectedCards={mySelectedCards}
        handleCounterTokenModification={this.handleCounterTokenModification}
        handleImportDeck={this.handleImportDeckFromMenu}
        clearContextMenu={this.clearContextMenu}
        handleFindSpecificCard={this.handleFindSpecificCard}
        handleShowEncounterLoader={this.handleShowEncounterLoader}
        handleConnectToOnlineGame={this.handleConnectToOnlineGame}
      ></GameContextMenuContainer>
    );
  };

  private renderPreviewCardModal = (previewCardUrls: string[][]) => {
    if (
      !this.state.previewCardModal &&
      !this.props.gameState.menuPreviewCardModal
    )
      return null;

    if (previewCardUrls.length === 0 || previewCardUrls[0].length === 0)
      return null;

    const imgUrl = previewCardUrls[0][0];

    return (
      <TopLayer
        trasparentBackground={true}
        fullHeight={true}
        fullWidth={true}
        noPadding={true}
        position={{ x: 0, y: 0 }}
        onSwipeUp={() => {
          this.props.togglePreviewCardRotation();
        }}
        completed={() => {
          this.props.clearPreviewCard();
          this.setState({
            previewCardModal: false,
          });
        }}
      >
        <div className="preview-card-modal">
          <img src={imgUrl}></img>
        </div>
      </TopLayer>
    );
  };

  private showContextMenuAtPosition = (pos: Vector2d) => {
    this.setState({ showEmptyMessage: false });
    this.handleContextMenu(undefined, pos);
  };

  private renderOptionsMenu = () => {
    return (
      <OptionsMenuContainer
        showContextMenuAtPosition={this.showContextMenuAtPosition}
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
                  y:
                    (containerRect.bottom - Math.max(containerRect.top, 0)) / 4,
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

    const privateApiAvailable =
      !!GamePropertiesMap[this.props.currentGameType].privateDecklistApi;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.deckImporterPosition ?? { x: 0, y: 0 };
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing deck importer position");
    }

    return (
      <TopLayer
        position={{
          x: containerRect.left + pointerPosition.x,
          y: Math.max(containerRect.top, 0) + pointerPosition.y,
        }}
        completed={this.clearDeckImporter}
      >
        <DeckLoader
          loadDeckId={this.handleImportDeck(
            this.getRelativePositionFromTarget(this.stage)
          )}
          showPrivateApiOption={privateApiAvailable}
        />
      </TopLayer>
    );
  };

  private renderEncounterImporter = () => {
    if (!this.state.showEncounterImporter) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.encounterImporterPosition ?? {
      x: 0,
      y: 0,
    };
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing deck importer position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: Math.max(containerRect.top, 0) + pointerPosition.y,
    };

    return (
      <TopLayer position={pos} completed={this.clearEncounterImporter}>
        <EncounterLoaderContainer
          currentGameType={this.props.currentGameType}
          loadCards={this.handleLoadEncounter(
            this.getRelativePositionFromTarget(this.stage)
          )}
          customCards={this.state.importerForCustomCards}
        />
      </TopLayer>
    );
  };

  private renderCardSearch = () => {
    if (!this.state.showCardSearch) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.cardSearchPosition ?? { x: 0, y: 0 };
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing card search position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: Math.max(containerRect.top, 0) + pointerPosition.y,
    };

    return !!this.state.cardStackForSearching ? (
      <CardStackCardSelectorContainer
        touchBased={this.state.cardSearchTouchBased}
        card={this.state.cardStackForSearching}
        cardSelected={this.handleCardSelectedFromCardStack(
          this.state.cardStackForSearching.id,
          pos
        )}
        completed={this.clearCardSearch}
      />
    ) : // </TopLayer>
    null;
  };

  private renderPeerConnector = () => {
    if (!this.state.showPeerConnector) return null;

    const containerRect = this.stage?.container().getBoundingClientRect();
    const pointerPosition = this.state.peerConnectorPosition ?? { x: 0, y: 0 };
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing peer connector position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: Math.max(containerRect.top, 0) + pointerPosition.y,
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
    const pointerPosition = this.state.tokenValueModifierPosition ?? {
      x: 0,
      y: 0,
    };
    if (!containerRect || !pointerPosition) {
      throw new Error("Problem computing token Modifier position");
    }

    const pos = {
      x: containerRect.left + pointerPosition.x,
      y: Math.max(containerRect.top, 0) + pointerPosition.y,
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

  private handleLoadEncounter =
    (position: Vector2d) =>
    (
      cards: CardData[][],
      tokens: IFlippableToken[],
      counters: ICounter[],
      playerBoards: IPlayerBoard[]
    ) => {
      this.clearEncounterImporter();

      const sizeTypeToOffsetMap: { [key in CardSizeType]: Vector2d } = {} as {
        [key in CardSizeType]: Vector2d;
      };

      let yOffset = 0;
      Object.values(CardSizeType).forEach((type) => {
        sizeTypeToOffsetMap[type] = { x: 0, y: yOffset };
        // Tarot is the biggest card size, so use that
        yOffset += cardConstants[CardSizeType.PlayerBoard].CARD_HEIGHT + 20;
      });

      cards.forEach((c, index) => {
        const cardSizeType = c[0]?.extraInfo.sizeType ?? CardSizeType.Standard;
        this.props.addCardStack({
          position: {
            x: position.x + sizeTypeToOffsetMap[cardSizeType].x,
            y: position.y + sizeTypeToOffsetMap[cardSizeType].y,
          },
          cardJsonIds: c.map((card) => card.code),
        });

        sizeTypeToOffsetMap[cardSizeType] = {
          x:
            sizeTypeToOffsetMap[cardSizeType].x +
            cardConstants[cardSizeType].GRID_SNAP_WIDTH,
          y: sizeTypeToOffsetMap[cardSizeType].y,
        };
      });

      let lastTokenY = 0;
      if (tokens.length > 0) {
        // Put the tokens up a bit
        this.props.createNewTokens(
          tokens.map((t, idx) => {
            lastTokenY = position.y + 200 * idx;
            return {
              ...t,
              position: {
                x:
                  position.x -
                  cardConstants[
                    CardSizeType.Tarot //Tarot is the largest card size
                  ].CARD_WIDTH *
                    2,
                y: lastTokenY,
              },
            };
          })
        );
      }

      if (counters.length > 0) {
        // Put the counters up a bit
        counters.forEach((c, idx) => {
          this.props.addNewCounter(
            {
              x:
                position.x -
                cardConstants[
                  CardSizeType.Tarot //Tarot is the largest card size
                ].CARD_WIDTH *
                  2,
              y: lastTokenY + 200 * (idx + 1),
            },
            c.imgUrl,
            c.text,
            c.color
          );
        });
      }

      let lastPBY = position.y;
      if (playerBoards.length > 0) {
        // Put the player Boards right at the load spot
        this.props.createNewPlayerBoards(
          playerBoards.map((pb) => {
            const pbToReturn: IPlayerBoard = {
              ...pb,
              ...{
                x: position.x,
                y: lastPBY,
              },
            };

            lastPBY += pb.width + 10;

            return pbToReturn;
          })
        );
      }

      // Cache the images
      const imgUrls = cards.flat().reduce((urls, card) => {
        const faceupCard = getImgUrlsFromJsonId(
          card.code,
          true,
          this.props.cardsData,
          this.props.currentGameType
        );
        const facedownCard = getImgUrlsFromJsonId(
          card.code,
          false,
          this.props.cardsData,
          this.props.currentGameType
        );
        return urls.concat(faceupCard, facedownCard);
      }, [] as string[]);

      const tokenUrls = tokens.map((t) => t.imgUrl);
      const playerBoardUrls = playerBoards.map((pb) => pb.image);

      const uniqueUrls = Array.from(new Set(imgUrls));
      const uniqueTokenUrls = Array.from(new Set(tokenUrls));
      const uniquePlayerBoardUrls = Array.from(new Set(playerBoardUrls));

      cacheImages(
        uniqueUrls.concat(uniqueTokenUrls).concat(uniquePlayerBoardUrls)
      );
    };

  private handleImportDeck =
    (position: Vector2d) => (id: number, usePrivateApi: boolean) => {
      this.clearDeckImporter();
      this.props.fetchDecklistById({
        gameType: this.props.currentGameType,
        decklistId: id,
        usePrivateApi: usePrivateApi,
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
      contextMenuCard: null,
      contextMenuCounterId: null,
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
    if (this.panMode || getDistance(this.state.selectStartPos, mousePos) < 30) {
      this.props.unselectAllCards();
      this.props.unselectAllTokens();
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

    //fix for "yo-yo" issue when scrolling slightly diagonal on a trackpad
    // whichever scroll direction is larger will be checked, the smaller movement is ignored
    const isVerticalScroll =
      Math.abs(event.evt.deltaY) > Math.abs(event.evt.deltaX);

    let isZoomIn;
    if (isVerticalScroll) {
      isZoomIn = event.evt.deltaY < 0;
    } else {
      isZoomIn = event.evt.deltaX > 0;
    }

    const newScale = isZoomIn ? oldScale * SCALE_BY : oldScale / SCALE_BY;

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

      this.setState({
        showContextMenu: true,
        contextMenuPosition: this.stage?.getPointerPosition() ?? null,
        contextMenuCounterId: counterId,
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

    this.setState({
      showContextMenu: true,
      contextMenuPosition: this.stage?.getPointerPosition() ?? null,
      contextMenuCard: !!card ? card : null,
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
    this.props.exhaustAllCards(cardId);
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

  private handleDroppedBackInHand = () => {
    this.captureLastMousePos = true;
    this.props.clearMyGhostCards();
  };

  private handleDroppedOnTable = (
    ids: string[],
    faceup: boolean,
    pos?: Vector2d
  ) => {
    const myDropTargetCard =
      Object.values(this.props.dropTargetCardsById).filter(
        (dt) => dt.ownerRef === myPeerRef
      )[0] ?? null;

    if (!!myDropTargetCard) {
      if (!!myDropTargetCard.card?.cardStack) {
        this.props.addToExistingCardStack({
          existingStackId: myDropTargetCard.card?.cardStack?.id ?? "",
          cardJsonIds: ids,
        });
      } else if (!!myDropTargetCard.card?.playerBoardSlot) {
        this.props.addCardStackToPlayerBoardSlot({
          cardJsonIds: ids,
          slot: myDropTargetCard.card.playerBoardSlot,
        });
      }
    } else {
      ids.forEach((id, index) => {
        const basePos = !!pos ? pos : this.lastMousePos;

        const basePosTranslated = this.getRelativePositionFromTarget(
          this.stage,
          basePos
        );

        //TODO: Try to figure out the card size here
        const newPos = {
          x:
            basePosTranslated.x +
            index * cardConstants[CardSizeType.Standard].GRID_SNAP_WIDTH,
          y: basePosTranslated.y,
        };

        this.props.addCardStack({
          cardJsonIds: [id],
          position: newPos,
          faceup,
        });
      });
    }
    this.props.clearMyGhostCards();
    this.captureLastMousePos = true;
  };

  private handleCardDragStart = (
    cardId: string,
    event: KonvaEventObject<DragEvent>,
    forceSplit: boolean
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
        // Check if we're dragging in the upper right corner of the card - TOUCH ONLY NOW
        const upperRightPoint = {
          x:
            draggingCard.x +
            (draggingCard.exhausted
              ? cardConstants[draggingCard.sizeType].CARD_HEIGHT
              : cardConstants[draggingCard.sizeType].CARD_WIDTH) /
              2,
          y:
            draggingCard.y -
            (draggingCard.exhausted
              ? cardConstants[draggingCard.sizeType].CARD_WIDTH
              : cardConstants[draggingCard.sizeType].CARD_HEIGHT) /
              2,
        };
        const distance = getDistance(
          upperRightPoint,
          this.getRelativePositionFromTarget(this.stage)
        );

        const dragDistanceThreshold = !!(event.evt as any).touches
          ? cardConstants[draggingCard.sizeType].TOUCH_DRAG_SPLIT_DISTANCE
          : 0; //We set this to 0 for non-touches so we completely respect the forceSplit flag when splitting

        if (forceSplit || distance < dragDistanceThreshold) {
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
      this.props.addToPlayerHandWithRoleCheck({
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
    } else if (code === "r") {
      this.props.togglePreviewCardRotation();
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
      this.props.exhaustAllCards();
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
    let intCode = parseInt(code);

    if (code === "meta") {
      this.setState({
        forcePan: true,
      });
    }

    if (event.key === "a" && !this.props.gameState.drawingArrow) {
      this.props.setDrawingArrow(true);
    }

    // console.log("event.key", event.key);
    // console.log("intCode", intCode);
    // console.log("keyCode", event.keyCode);
    // console.log("key", event.key);
    // console.log("META", event.metaKey);

    // Map the shift cases
    if (event.key === "!") {
      intCode = 1;
    } else if (event.key === "@") {
      intCode = 2;
    } else if (event.key === "#") {
      intCode = 3;
    } else if (event.key === "$") {
      intCode = 4;
    } else if (event.key === "%") {
      intCode = 5;
    } else if (event.key === "^") {
      intCode = 6;
    } else if (event.key === "&") {
      intCode = 7;
    } else if (event.key === "*") {
      intCode = 8;
    } else if (event.key === "(") {
      intCode = 9;
    } else if (event.key === ")") {
      intCode = 0;
    }

    // If all else fails, try keyCode
    if (Number.isNaN(intCode)) {
      if (event.keyCode === 49) {
        intCode = 1;
      } else if (event.keyCode === 50) {
        intCode = 2;
      } else if (event.keyCode === 51) {
        intCode = 3;
      } else if (event.keyCode === 52) {
        intCode = 4;
      } else if (event.keyCode === 53) {
        intCode = 5;
      } else if (event.keyCode === 54) {
        intCode = 6;
      } else if (event.keyCode === 55) {
        intCode = 7;
      } else if (event.keyCode === 56) {
        intCode = 8;
      } else if (event.keyCode === 57) {
        intCode = 9;
      } else if (event.keyCode === 48) {
        intCode = 0;
      }
    }

    if (
      (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) &&
      !Number.isNaN(intCode)
    ) {
      const defaultTokenInfoForGameType =
        GamePropertiesMap[this.props.currentGameType].tokens;

      let tokenInfoForGameType = defaultTokenInfoForGameType;
      const mySelectedCards = getMySelectedCards(this.props.cards.cards);

      if (
        !!GameManager.getModuleForType(this.props.currentGameType)
          .getCustomTokenInfoForCard &&
        mySelectedCards.length > 0
      ) {
        tokenInfoForGameType =
          GameManager.getModuleForType(this.props.currentGameType)
            .getCustomTokenInfoForCard!!(
            mySelectedCards[0],
            getCardType(mySelectedCards[0], this.props.cardsData),
            defaultTokenInfoForGameType
          ) ?? defaultTokenInfoForGameType;
      }

      switch (intCode) {
        case 1:
          if (!!tokenInfoForGameType.damage) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Damage,
              delta: event.shiftKey ? -1 : 1,
            });
          }
          break;
        case 2:
          if (!!tokenInfoForGameType.threat) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Threat,
              delta: event.shiftKey ? -1 : 1,
            });
          }
          break;

        case 3:
          if (!!tokenInfoForGameType.generic) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Generic,
              delta: event.shiftKey ? -1 : 1,
            });
          }
          break;
        case 4:
          if (!!tokenInfoForGameType.acceleration) {
            this.props.adjustCounterToken({
              tokenType: CounterTokenType.Acceleration,
              delta: event.shiftKey ? -1 : 1,
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
    const code = event.key.toLocaleLowerCase();
    if (code === "meta") {
      this.setState({
        forcePan: false,
      });
    }

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

  private getRawPreviewCardPosition = (
    horizontal: boolean,
    sizeType: CardSizeType
  ): Vector2d => {
    const pointerPos = this.stage?.getPointerPosition() ?? { x: 0, y: 0 };
    const screenMidPointX = window.innerWidth / 2;
    const screenMidPointY = window.innerHeight / 2;

    const widthToUse = horizontal
      ? cardConstants[sizeType].CARD_PREVIEW_HEIGHT
      : cardConstants[sizeType].CARD_PREVIEW_WIDTH;
    const heightToUse = horizontal
      ? cardConstants[sizeType].CARD_PREVIEW_WIDTH
      : cardConstants[sizeType].CARD_PREVIEW_HEIGHT;

    // if (this.state.previewCardModal) {
    //   return {
    //     x: screenMidPointX,
    //     y: screenMidPointY,
    //   };
    // }

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
    if (this.panMode && !this.props.gameState.drawingArrow) {
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
    if (this.panMode && !this.props.gameState.drawingArrow) {
      return false;
    }
    // if we were selecting, check for intersection
    if (this.state.drewASelectionRect) {
      const selectRect = this.getSelectionRectInfo();
      const selectedCards: ICardStack[] = this.props.cards.cards.reduce<
        ICardStack[]
      >((currSelectedCards, card) => {
        const intersects = Intersects.boxBox(
          selectRect.x,
          selectRect.y,
          selectRect.width,
          selectRect.height,
          card.x - 50,
          card.y - 75,
          cardConstants[card.sizeType].CARD_WIDTH,
          cardConstants[card.sizeType].CARD_HEIGHT
        );

        if (intersects) {
          currSelectedCards.push(card);
        }

        return currSelectedCards;
      }, []);

      const selectedTokens: IFlippableToken[] = this.props.tokens.reduce<
        IFlippableToken[]
      >((currSelectedTokens, token) => {
        const intersects = Intersects.boxBox(
          selectRect.x,
          selectRect.y,
          selectRect.width,
          selectRect.height,
          token.position.x,
          token.position.y,
          tokenConstants.FLIPPABLE_TOKEN_WIDTH,
          tokenConstants.FLIPPABLE_TOKEN_HEIGHT
        );

        if (intersects) {
          currSelectedTokens.push(token);
        }

        return currSelectedTokens;
      }, []);

      // Here check if modifier held down
      const modifierKeyHeld =
        event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey;

      if (selectedCards.length > 0) {
        this.props.selectMultipleCards({
          ids: selectedCards.map((card) => card.id),
          unselectOtherCards: !modifierKeyHeld,
        });
      }

      if (selectedTokens.length > 0) {
        this.props.handleTokenSelect({
          ids: selectedTokens.map((t) => t.id),
          forceSelected: true,
        });
      }
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
    if (this.panMode && !this.props.gameState.drawingArrow) {
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

    this.setState({
      showContextMenu: true,
      contextMenuPosition: pos ?? this.stage?.getPointerPosition() ?? null,
    });
  };

  private getCardName = (card: ICardStack) => {
    const cardInQuestion = card.faceup
      ? card.cardStack[0]
      : card.cardStack[card.cardStack.length - 1];
    return this.props.cardsData[cardInQuestion.jsonId]?.name ?? "";
  };

  private getCardCode = (card: ICardStack, returnBackCode?: boolean) => {
    const cardInQuestion = card.faceup
      ? card.cardStack[0]
      : card.cardStack[card.cardStack.length - 1];

    if (!cardInQuestion) {
      log.error("Could not get card in question for stack:", card);
    }

    const idToGrab = cardInQuestion?.jsonId ?? "missing-id";

    const frontCode =
      this.props.cardsData[idToGrab]?.code ?? `code missing for ${idToGrab}`;
    const backCode =
      this.props.cardsData[idToGrab]?.backLink ?? `Back of ${frontCode}`;
    return returnBackCode ? backCode : frontCode;
  };

  // Commented out as part of fixing issue with orientation change on android on 3/1/2024
  // private handleResize = debounce(() => {
  //   this.setState({
  //     stageHeight: window.innerHeight - playerHandHeightPx,
  //     stageWidth: window.innerWidth,
  //   });
  // }, 100);
}

export default withConfirm(Game);
