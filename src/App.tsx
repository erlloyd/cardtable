import { ReactReduxContext, Provider } from "react-redux";
import * as Intersects from "intersects";
import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import { Vector2d } from "konva/types/types";
import * as React from "react";
import { Component } from "react";
import { Layer, Rect, Stage } from "react-konva";
import "./App.scss";
import Card, { HORIZONTAL_TYPE_CODES } from "./Card";
import { cardConstants } from "./constants/card-constants";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import DeckLoader from "./DeckLoader";
import EncounterLoaderContainer from "./EncounterLoaderContainer";
import { ICardData } from "./features/cards-data/initialState";
import {
  CounterTokenType,
  StatusTokenType,
} from "./features/cards/cards.slice";
import { ICardsState, ICardStack } from "./features/cards/initialState";
import { IGameState } from "./features/game/initialState";
import TopLayer from "./TopLayer";
import { getCenter, getDistance } from "./utilities/geo";
import CardStackCardSelectorContainer from "./CardStackCardSelectorContainer";
import Counter from "./Counter";
import PeerConnector from "./PeerConnector";
import { myPeerRef, PlayerColor } from "./constants/app-constants";
import { ICounter } from "./features/counters/initialState";
import { MISSING_CARD_IMAGE_MAP } from "./constants/card-missing-image-map";
import { CardData } from "./external-api/marvel-card-data";
import { CARD_PACK_REMAPPING } from "./constants/card-pack-mapping";

const SCALE_BY = 1.02;

interface IProps {
  cards: ICardsState;
  cardsData: ICardData;
  gameState: IGameState;
  showPreview: boolean;
  panMode: boolean;
  playerColors: { [key: string]: PlayerColor };
  cardMove: (info: { id: string; dx: number; dy: number }) => void;
  endCardMove: (id: string) => void;
  exhaustCard: (id: string) => void;
  selectCard: (payload: { id: string; unselectOtherCards: boolean }) => void;
  unselectCard: (id: string) => void;
  toggleSelectCard: (id: string) => void;
  startCardMove: (payload: { id: string; splitTopCard: boolean }) => void;
  unselectAllCards: (payload?: any) => void;
  selectMultipleCards: (cards: { ids: string[] }) => void;
  hoverCard: (id: string) => void;
  hoverLeaveCard: (id: string) => void;
  togglePanMode: () => void;
  flipCards: () => void;
  loadCardsData: () => void;
  shuffleStack: (id: string) => void;
  fetchDecklistById: (payload: {
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
    id: string;
    tokenType: StatusTokenType;
    value: boolean;
  }) => void;
  adjustCounterToken: (payload: {
    id: string;
    tokenType: CounterTokenType;
    delta: number;
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
}
class App extends Component<IProps, IState> {
  public stage: Konva.Stage | null = null;

  private touchTimer: any = null;

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
    };
  }

  public componentDidMount() {
    this.props.loadCardsData();
  }

  public render() {
    const staticCards = this.props.cards.cards
      .filter((card) => !card.dragging)
      .map((card) => {
        return (
          <Card
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
            dropTarget={card.id === this.props.cards.dropTargetCard?.id}
            dragging={card.dragging}
            handleDragStart={this.handleCardDragStart}
            handleDragMove={this.props.cardMove}
            handleDragEnd={this.props.endCardMove}
            handleDoubleClick={this.handleSelectAndExhaust}
            handleClick={this.handleCardClick(card)}
            handleHover={this.props.hoverCard}
            handleHoverLeave={this.props.hoverLeaveCard}
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

    const previewCards = this.stage
      ? this.props.cards.cards
          .filter(
            (card) =>
              !this.state.selecting &&
              this.props.showPreview &&
              !!this.props.cards.previewCard &&
              card.id === this.props.cards.previewCard.id
          )
          .map((card) => {
            const rawPos = this.getRawPreviewCardPosition();
            const previewPos = this.getRelativePositionFromTarget(
              this.stage,
              rawPos
            );
            return (
              <Card
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
                exhausted={HORIZONTAL_TYPE_CODES.includes(
                  this.getCardType(card)
                )}
                fill={card.fill}
                selected={false}
                dragging={false}
                imgUrls={this.getImgUrls(card)}
                typeCode={this.getCardType(card)}
                faceup={card.faceup}
                height={cardConstants.CARD_PREVIEW_HEIGHT}
                width={cardConstants.CARD_PREVIEW_WIDTH}
              />
            );
          })
      : [];

    return (
      <div
        className="play-area"
        tabIndex={1}
        onKeyDown={this.handleKeyDown}
        onKeyPress={this.handleKeyPress}
      >
        {this.renderEmptyMessage()}
        {this.renderContextMenu()}
        {this.renderDeckImporter()}
        {this.renderEncounterImporter()}
        {this.renderCardSearch()}
        {this.renderPeerConnector()}
        <ReactReduxContext.Consumer>
          {({ store }) => (
            <Stage
              ref={(ref) => {
                if (!ref) return;

                this.stage = ref;
              }}
              x={this.props.gameState.stagePosition.x}
              y={this.props.gameState.stagePosition.y}
              width={window.innerWidth}
              height={window.innerHeight}
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
                  {this.props.counters.map((counter) => (
                    <Counter
                      key={`${counter.id}-counter`}
                      id={counter.id}
                      pos={counter.position}
                      value={counter.value}
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
                  {staticCards
                    .concat(ghostCards)
                    .concat(movingCards)
                    .concat(previewCards)}
                </Layer>
                <Layer>
                  <Rect
                    x={this.state.selectStartPos.x}
                    y={this.state.selectStartPos.y}
                    width={this.state.selectRect.width}
                    height={this.state.selectRect.height}
                    stroke="black"
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

  private handleCounterDrag = (id: string) => (
    event: KonvaEventObject<DragEvent>
  ) => {
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
        Right click and select 'Load Deck ID' to load a deck from marvelcdb.com
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

  private handleLoadEncounter = (position: Vector2d) => (cards: string[]) => {
    this.clearEncounterImporter();
    this.props.addCardStack({ position, cardJsonIds: cards });
  };

  private handleImportDeck = (position: Vector2d) => (id: number) => {
    this.clearDeckImporter();
    this.props.fetchDecklistById({ decklistId: id, position });
  };

  private handlePeerConnect = (peerId: string) => {
    this.clearPeerConnector();
    this.props.connectToRemoteGame(peerId);
  };

  private handleCardSelectedFromCardStack = (
    cardStackId: string,
    pos: Vector2d
  ) => (jsonId: string) => {
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

  private handleCounterContextMenu = (counterId: string) => (
    event: KonvaEventObject<PointerEvent>
  ) => {
    event.evt.preventDefault();
    event.cancelBubble = true;

    const menuItems = [
      {
        label: "Remove",
        action: () => {
          this.props.removeCounter(counterId);
        },
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

    // First, select the card
    this.props.selectCard({ id: cardId, unselectOtherCards: false });

    const card = this.props.cards.cards.find((c) => c.id === cardId);
    const numCardsInStack = card?.cardStack?.length || 0;
    const currentStatusTokens = card?.statusTokens || {
      stunned: false,
      confused: false,
      tough: false,
    };

    const menuItems = [
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
          this.props.shuffleStack(cardId);
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
      label: !!currentStatusTokens.stunned ? "Remove Stun" : "Stun",
      action: () => {
        this.props.toggleToken({
          id: card?.id || "",
          tokenType: StatusTokenType.Stunned,
          value: !currentStatusTokens.stunned,
        });
      },
    });

    menuItems.push({
      label: !!currentStatusTokens.confused ? "Remove Confused" : "Confuse",
      action: () => {
        this.props.toggleToken({
          id: card?.id || "",
          tokenType: StatusTokenType.Confused,
          value: !currentStatusTokens.confused,
        });
      },
    });

    menuItems.push({
      label: !!currentStatusTokens.tough ? "Remove Tough" : "Tough",
      action: () => {
        this.props.toggleToken({
          id: card?.id || "",
          tokenType: StatusTokenType.Tough,
          value: !currentStatusTokens.tough,
        });
      },
    });

    menuItems.push({
      label: "Add 1 Damage",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Damage,
          delta: 1,
        });
      },
    });

    menuItems.push({
      label: "Remove 1 Damage",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Damage,
          delta: -1,
        });
      },
    });

    menuItems.push({
      label: "Add 1 Threat",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Threat,
          delta: 1,
        });
      },
    });

    menuItems.push({
      label: "Remove 1 Threat",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Threat,
          delta: -1,
        });
      },
    });

    menuItems.push({
      label: "Add 1 Generic Token",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Generic,
          delta: 1,
        });
      },
    });

    menuItems.push({
      label: "Remove 1 Generic Token",
      action: () => {
        this.props.adjustCounterToken({
          id: card?.id || "",
          tokenType: CounterTokenType.Generic,
          delta: -1,
        });
      },
    });

    this.setState({
      showContextMenu: true,
      contextMenuPosition: this.stage?.getPointerPosition() ?? null,
      contextMenuItems: menuItems,
    });
  };

  private handleCardClick = (card: ICardStack) => (
    cardId: string,
    event: KonvaEventObject<MouseEvent>
  ) => {
    // Here check if modifier held down
    const modifierKeyHeld =
      event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey;

    if (card.selected && modifierKeyHeld) {
      this.props.toggleSelectCard(cardId);
    } else {
      this.props.selectCard({
        id: cardId,
        unselectOtherCards: !modifierKeyHeld,
      });
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
          x: draggingCard.x + cardConstants.CARD_WIDTH / 2,
          y: draggingCard.y - cardConstants.CARD_HEIGHT / 2,
        };
        const distance = getDistance(
          upperRightPoint,
          this.getRelativePositionFromTarget(this.stage)
        );
        if (distance < 30) {
          splitTopCard = true;
        }
      }
    }

    this.props.startCardMove({ id: cardId, splitTopCard });
  };

  private handleKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    const code = event.which || event.keyCode;
    if (code === 115) {
      this.props.togglePanMode();
    } else if (code === 102) {
      this.props.flipCards();
    }
  };

  private handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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

  private getRawPreviewCardPosition = (): Vector2d => {
    const pointerPos = this.stage?.getPointerPosition() ?? { x: 0, y: 0 };
    const screenMidPointX = window.innerWidth / 2;
    return pointerPos.x < screenMidPointX
      ? {
          x: window.innerWidth - cardConstants.CARD_PREVIEW_WIDTH / 2,
          y: cardConstants.CARD_PREVIEW_HEIGHT / 2,
        }
      : {
          x: cardConstants.CARD_PREVIEW_WIDTH / 2,
          y: cardConstants.CARD_PREVIEW_HEIGHT / 2,
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

  private handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    if (event.evt.button === 0) {
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

  private handleMouseUp = () => {
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

      this.props.selectMultipleCards({
        ids: selectedCards.map((card) => card.id),
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

  private handleTouchStart = (event: any) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.handleContextMenu(event);
    }, 750);
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
    } else if (!this.props.panMode) {
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

  private handleTouchEnd = (event: any) => {
    this.lastDist = 0;
    this.lastCenter = null;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
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

  private handleContextMenu = (event: KonvaEventObject<PointerEvent>): void => {
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
        label: "Load Deck ID",
        action: () => {
          this.setState({
            showDeckImporter: true,
            deckImporterPosition: this.stage?.getPointerPosition() ?? null,
          });
        },
      },
      {
        label: "Load Encounter",
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
        action: () => {},
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

    return cardData.type_code;
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
    return this.props.cardsData[cardInQuestion.jsonId]?.code ?? "code missing";
  };

  private checkMissingImageMap(code: string): string | null {
    return MISSING_CARD_IMAGE_MAP[code] ?? null;
  }

  private generateLCGCDNImageUrl(card: CardData, faceup: boolean): string {
    // get the first two digits

    let codeToUse = card.code;

    if (!faceup && !!card.back_link) {
      codeToUse = card.back_link;
    }

    const groupCode =
      CARD_PACK_REMAPPING[card.pack_code] ?? codeToUse.substring(0, 2);
    let cardCode = codeToUse.substring(2);

    //trim leading "0" chars
    while (cardCode[0] === "0") {
      cardCode = cardCode.substring(1);
    }

    cardCode = cardCode.toLocaleUpperCase();

    let cardSuffix = "";

    if (!!card.double_sided) {
      cardSuffix = faceup ? "A" : "B";
    }

    return `https://lcgcdn.s3.amazonaws.com/mc/MC${groupCode}en_${cardCode}${cardSuffix}.jpg`;
  }

  private getImgUrls = (card: ICardStack): string[] => {
    if (Object.keys(this.props.cardsData).length === 0) return [];

    let urls: string[] = [];

    const topCardData = this.props.cardsData[card.cardStack[0].jsonId];
    const bottomCardData = this.props.cardsData[
      card.cardStack[card.cardStack.length - 1].jsonId
    ];

    let cardData: CardData | null = topCardData;

    if (
      !card.faceup &&
      (!!bottomCardData.back_link || !!bottomCardData.double_sided)
    ) {
      cardData = bottomCardData;
      urls = [
        this.generateLCGCDNImageUrl(bottomCardData, card.faceup),
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.png`,
        // `https://marvelcdb.com/bundles/cards/${bottomCardData.back_link}.jpg`,
        // process.env.PUBLIC_URL +
        //   "/images/cards/" +
        //   bottomCardData.octgn_id +
        //   ".b.jpg",
      ];
    } else if (!card.faceup) {
      cardData = null;
      urls = [process.env.PUBLIC_URL + "/images/standard/card_back.png"];
    }
    if (urls.length === 0) {
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

    const missingImageOverride = !!cardData
      ? this.checkMissingImageMap(
          card.faceup ? cardData.code : cardData.back_link ?? ""
        )
      : null;

    if (!!missingImageOverride) {
      urls.unshift(missingImageOverride);
    }

    return urls;
  };
}

export default App;
