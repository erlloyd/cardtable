import isEqual from "lodash.isequal";
import {
  CaseReducer,
  createSlice,
  Draft,
  original,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";
import { v4 as uuidv4 } from "uuid";
import {
  CardAttachLocation,
  cardConstants,
  CardSizeType,
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import {
  receiveRemoteGameState,
  resetApp,
  startDraggingCardFromHand,
  verifyRemoteGameState,
} from "../../store/global.actions";
import { getDistance } from "../../utilities/geo";
import {
  addCardStackToPlayerBoardWithId,
  addCardStackWithSnapAndId,
  createDeckFromTextFileWithIds,
  CreateDeckPayload,
  drawCardsOutOfCardStackWithIds,
  pullCardOutOfCardStackWithId,
  replaceCardStack,
  setStackShuffling,
  startCardMoveWithSplitStackId,
} from "./cards.actions";
import { fetchDecklistById } from "./cards.thunks";
import {
  generateDefaultPlayerHands,
  ICardDetails,
  ICardSlot,
  ICardsState,
  ICardStack,
  IDropTarget,
  initialState,
  IPlayerBoard,
  IPlayerHandCard,
} from "./initialState";
import { myPeerRef } from "../../constants/app-constants";
import log from "loglevel";
import { makeFakeCardStackFromJsonId } from "../../utilities/card-utils";
import { makeBasicPlayerBoard } from "../../utilities/playerboard-utils";
import { updateActiveGameType } from "../game/game.slice";
import GameManager from "../../game-modules/GameModuleManager";

const CARD_DROP_TARGET_DISTANCE = 30;
const CARD_ATTACH_TARGET_MIN_DISTANCE = 50;
const CARD_ATTACH_TARGET_MAX_DISTANCE = 150;
export const COUNT_OUT_OF_SYNC_THRESHOLD = 3;
// Helper methods
const addAttachedCard = (attachee: ICardStack, attacher: ICardStack) => {
  let cardIds = attachee.attachedCardIds;

  if (!cardIds) {
    cardIds = [];
  }

  cardIds.push(attacher.id);
  return cardIds;
};

const removeAttachedCard = (state: ICardsState, card: ICardStack) => {
  if (card.attachedTo) {
    const attachedTo = state.cards.find((c) => c.id === card.attachedTo);
    if (!!attachedTo && !!attachedTo.attachedCardIds) {
      attachedTo.attachedCardIds = attachedTo.attachedCardIds.filter(
        (cId) => cId !== card.id
      );
    }
    card.attachedTo = null;
  }
};

const createNewEmptyCardStackWithId = (id: string): ICardStack => {
  return {
    controlledBy: "",
    x: 0,
    y: 0,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "red",
    id,
    cardStack: [],
    selected: false,
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

const transformGhostCardsWhenSnapping = (
  state: ICardsState,
  shouldSnap: boolean,
  actorRef: string,
  dropTarget: IDropTarget | null,
  attachTarget: ICardStack | null,
  card?: ICardStack
): ICardStack[] => {
  const hasDropTarget = !!dropTarget;
  const hasAttachTarget = !!attachTarget;

  let returnCards: ICardStack[] = state.ghostCards;
  if (shouldSnap && !hasDropTarget && !hasAttachTarget) {
    if (!!card && !card.attachedTo) {
      //////////
      ////TODO: Figure out how to generalize this
      //////////
      const snapCard = JSON.parse(JSON.stringify(card));
      snapCard.id = `${card.id}-grid`;
      snapCard.x =
        Math.round(card.x / cardConstants[card.sizeType].GRID_SNAP_WIDTH) *
        cardConstants[card.sizeType].GRID_SNAP_WIDTH;
      snapCard.y =
        Math.round(card.y / cardConstants[card.sizeType].GRID_SNAP_HEIGHT) *
        cardConstants[card.sizeType].GRID_SNAP_HEIGHT;
      snapCard.cardStack = [{ jsonId: `grid` }];

      // Check if there is already a snap card for this card
      // rendered at the x,y pos
      if (
        !state.ghostCards.some(
          (gc) =>
            gc.id === `${card.id}-grid` &&
            gc.x === snapCard.x &&
            gc.y === snapCard.y
        )
      ) {
        //remove all other snap cards for this card
        returnCards = state.ghostCards.filter(
          (gc) => gc.id !== `${card.id}-grid`
        );
        // add the new snap card
        returnCards.push(snapCard);
      }
      //////////
      ////END HACKY DUPLICATE SECTION
      //////////
    } else {
      foreachSelectedAndControlledCard(state, actorRef, (card) => {
        if (card.attachedTo) return;
        const snapCard = JSON.parse(JSON.stringify(card));
        snapCard.id = `${card.id}-grid`;
        snapCard.x =
          Math.round(card.x / cardConstants[card.sizeType].GRID_SNAP_WIDTH) *
          cardConstants[card.sizeType].GRID_SNAP_WIDTH;
        snapCard.y =
          Math.round(card.y / cardConstants[card.sizeType].GRID_SNAP_HEIGHT) *
          cardConstants[card.sizeType].GRID_SNAP_HEIGHT;
        snapCard.cardStack = [{ jsonId: `grid` }];

        // Check if there is already a snap card for this card
        // rendered at the x,y pos
        if (
          !state.ghostCards.some(
            (gc) =>
              gc.id === `${card.id}-grid` &&
              gc.x === snapCard.x &&
              gc.y === snapCard.y
          )
        ) {
          //remove all other snap cards for this card
          returnCards = state.ghostCards.filter(
            (gc) => gc.id !== `${card.id}-grid`
          );
          // add the new snap card
          returnCards.push(snapCard);
        }
      });
    }
  } else if (hasDropTarget || hasAttachTarget) {
    // remove all snap cards
    returnCards = state.ghostCards.filter((gc) => !gc.id.includes("-grid"));

    // if we have a drop target, but it's a player board slot, we still want to
    // draw a ghost card
    if (hasDropTarget && !!dropTarget.playerBoardSlot) {
      //////////
      ////TODO: Figure out how to generalize this
      //////////

      if (!!card) {
        const pbCard: ICardStack = JSON.parse(JSON.stringify(card));
        pbCard.id = `${card.id}-grid`;
        pbCard.x = dropTarget.playerBoardSlot!!.pos.x;
        pbCard.y = dropTarget.playerBoardSlot!!.pos.y;
        pbCard.cardStack = [{ jsonId: `grid` }];
        pbCard.exhausted = dropTarget.playerBoardSlot!!.landscape;

        returnCards.push(pbCard);
      } else {
        foreachSelectedAndControlledCard(state, actorRef, (card) => {
          if (card.attachedTo) return;
          const snapCard = JSON.parse(JSON.stringify(card));
          snapCard.id = `${card.id}-grid`;
          snapCard.x = dropTarget.playerBoardSlot!!.pos.x;
          snapCard.y = dropTarget.playerBoardSlot!!.pos.y;
          snapCard.cardStack = [{ jsonId: `grid` }];

          // add the new snap card (we already removed all other snap cards in this branch)
          returnCards.push(snapCard);
        });
      }
      //////////
      ////END HACKY DUPLICATE SECTION
      //////////
    }
  } else if (!shouldSnap && !hasDropTarget && !hasAttachTarget) {
    // If we're not snapping and we have no target, we should clear all snap cards
    returnCards = state.ghostCards.filter((gc) => !gc.id.includes("-grid"));
  }
  return returnCards;
};

const getCardStackWithId = (
  state: ICardsState,
  id: string
): ICardStack | undefined => {
  return state.cards.find((card) => card.id === id);
};

const mutateCardWithId = (
  state: ICardsState,
  id: string,
  ref: string,
  callback: (card: ICardStack) => void
) => {
  const cardToUpdate = getCardStackWithId(state, id);
  if (
    cardToUpdate &&
    (cardToUpdate.controlledBy === "" || cardToUpdate.controlledBy === ref)
  ) {
    callback(cardToUpdate);
  }
};

const foreachSelectedAndControlledCard = (
  state: ICardsState,
  actorRef: string,
  callback: (card: ICardStack) => void
) => {
  state.cards
    .filter((card) => card.selected && card.controlledBy === actorRef)
    .forEach((card) => callback(card));
};

const foreachUnselectedCard = (
  state: ICardsState,
  callback: (card: ICardStack) => void
) => {
  state.cards
    .filter((card) => !card.selected)
    .forEach((card) => callback(card));
};

const getDropTargetCard = (
  state: ICardsState,
  draggedCardPosition: Vector2d,
  sizeType: CardSizeType,
  snapping: boolean = false,
  allowedDistance: number = CARD_DROP_TARGET_DISTANCE
): IDropTarget | null => {
  // go through and find if any unselected cards are potential drop targets
  // If so, get the closest one. But only if the card is owned / controlled by us

  // NOTE: We're also treating "slots" on a player board as potential drop targets

  const possibleDropTargets: { distance: number; dropTarget: IDropTarget }[] =
    [];

  if (snapping && possibleDropTargets.length === 0) {
    const wouldSnapX =
      Math.round(
        draggedCardPosition.x / cardConstants[sizeType].GRID_SNAP_WIDTH
      ) * cardConstants[sizeType].GRID_SNAP_WIDTH;
    const wouldSnapY =
      Math.round(
        draggedCardPosition.y / cardConstants[sizeType].GRID_SNAP_HEIGHT
      ) * cardConstants[sizeType].GRID_SNAP_HEIGHT;

    foreachUnselectedCard(state, (card) => {
      if (card.x === wouldSnapX && card.y === wouldSnapY) {
        // give the smallest possible distance so it will be picked
        possibleDropTargets.push({
          distance: 0,
          dropTarget: { cardStack: card },
        });
      }
    });
  }

  // If we didn't find a candidate based on snapping, then check distances
  if (possibleDropTargets.length === 0) {
    foreachUnselectedCard(state, (card) => {
      const distance = getDistance(
        { x: card.x, y: card.y },
        draggedCardPosition
      );
      if (distance < allowedDistance) {
        possibleDropTargets.push({
          distance,
          dropTarget: { cardStack: card },
        });
      }
    });
  }

  // console.log("CARD IS AT", draggedCardPosition);

  // Lastly go through all player board slots (including the main play area slots)
  if (possibleDropTargets.length === 0) {
    const boards = state.playerBoards.concat([
      makeBasicPlayerBoard({
        id: "TABLE",
        cardSlots: state.tableCardSlots,
        x: 0,
        y: 0,
      }),
    ]);

    boards.forEach((pb) => {
      pb.cardSlots.forEach((slot) => {
        const distance = getDistance(
          { x: pb.x + slot.relativeX, y: pb.y + slot.relativeY },
          draggedCardPosition
        );
        if (distance < allowedDistance) {
          // console.log("FOUND A SLOT");
          possibleDropTargets.push({
            distance,
            dropTarget: {
              playerBoardSlot: {
                boardId: pb.id,
                pos: {
                  x: pb.x + slot.relativeX,
                  y: pb.y + slot.relativeY,
                },
                landscape: slot.landscape,
              },
            },
          });
        }
      });
    });
  }

  return (
    possibleDropTargets.sort((c1, c2) => c1.distance - c2.distance)[0]
      ?.dropTarget ?? null
  );
};

// Reducers
const selectCardReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; unselectOtherCards: boolean }>
> = (state, action) => {
  if (action.payload.unselectOtherCards) {
    unselectAllCardsReducer(state, action);
  }

  mutateCardWithId(
    state,
    action.payload.id,
    (action as any).ACTOR_REF,
    (card) => {
      card.selected = true;
      card.controlledBy = (action as any).ACTOR_REF;
    }
  );
};

const unselectCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  mutateCardWithId(state, action.payload, (action as any).ACTOR_REF, (card) => {
    card.selected = false;
    card.controlledBy = "";
  });
};

const toggleSelectCardReducer: CaseReducer<
  ICardsState,
  PayloadAction<string>
> = (state, action) => {
  mutateCardWithId(state, action.payload, (action as any).ACTOR_REF, (card) => {
    card.selected = !card.selected;
    if (!card.selected) {
      card.controlledBy = "";
    } else {
      card.controlledBy = (action as any).ACTOR_REF;
    }
  });
};

const exhaustCardReducer: CaseReducer<
  ICardsState,
  PayloadAction<string | undefined>
> = (state, action) => {
  state.cards
    .filter(
      (card) =>
        card.controlledBy === (action as any).ACTOR_REF &&
        (card.id === (action.payload ?? "") || card.selected)
    )
    .forEach((card) => {
      card.exhausted = !card.exhausted;
    });
};

const exhaustAllCardsReducer: CaseReducer<
  ICardsState,
  PayloadAction<string | undefined>
> = (state, action) => {
  const cardsToChange = state.cards.filter(
    (card) =>
      card.controlledBy === (action as any).ACTOR_REF &&
      (card.id === (action.payload ?? "") || card.selected)
  );

  let shouldExhaust = true;
  if (cardsToChange.every((c) => c.exhausted)) {
    shouldExhaust = false;
  }

  cardsToChange.forEach((c) => (c.exhausted = shouldExhaust));
};

const deleteCardStackReducer: CaseReducer<
  ICardsState,
  PayloadAction<string | undefined>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    const stackIndex = state.cards.findIndex((c) => c.id === card.id);
    if (stackIndex !== -1) {
      state.cards.splice(stackIndex, 1);
    }
  });
};

const clearCardTokensReducer: CaseReducer<
  ICardsState,
  PayloadAction<string | undefined>
> = (state, action) => {
  state.cards
    .filter(
      (card) =>
        card.controlledBy === (action as any).ACTOR_REF &&
        (card.id === (action.payload ?? "") || card.selected)
    )
    .forEach((card) => {
      card.statusTokens = {
        tough: 0,
        stunned: 0,
        confused: 0,
      };

      card.counterTokens = {
        damage: 0,
        threat: 0,
        generic: 0,
        acceleration: 0,
      };

      card.modifiers = {};
      card.extraIcons = [];
    });
};

const getAttachDrawPos = (
  state: Draft<ICardsState>,
  baseCard: ICardStack,
  attachLocation: CardAttachLocation
): Vector2d => {
  let drawPos = { x: 0, y: 0 };
  let takenSpace = true;
  for (let i = 0; takenSpace; i++) {
    let xToDraw = baseCard.x;
    let yToDraw = baseCard.y;

    switch (attachLocation) {
      case CardAttachLocation.UpAndRight:
        xToDraw = baseCard.x + (i + 1) * 50;
        yToDraw = baseCard.y - (i + 1) * 50;
        break;
      case CardAttachLocation.Below:
        xToDraw = baseCard.x;
        yToDraw = baseCard.y + (i + 1) * 35;
        break;
      case CardAttachLocation.Left:
        xToDraw = baseCard.x - (i + 1) * 35;
        yToDraw = baseCard.y;
        break;
      case CardAttachLocation.DownAndLeft:
        xToDraw = baseCard.x - (i + 1) * 50;
        yToDraw = baseCard.y + (i + 1) * 50;
        break;
      default:
        xToDraw = baseCard.x;
        yToDraw = baseCard.y;
    }

    drawPos = { x: xToDraw, y: yToDraw };

    //Check for existing card
    takenSpace = !!state.cards.find((c) => c.x === xToDraw && c.y === yToDraw);
  }
  return drawPos;
};

const cardFromHandMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ x: number; y: number; sizeType: CardSizeType; snap: boolean }>
> = (state, action) => {
  state.dropTargetCards[(action as any).ACTOR_REF] = getDropTargetCard(
    state,
    action.payload,
    action.payload.sizeType,
    action.payload.snap,
    CARD_DROP_TARGET_DISTANCE * 2
  );

  const dropTarget = state.dropTargetCards[(action as any).ACTOR_REF];

  const newEmptyCard = createNewEmptyCardStackWithId(`${myPeerRef}-fromHand`);
  newEmptyCard.controlledBy = myPeerRef;
  newEmptyCard.x = action.payload.x;
  newEmptyCard.y = action.payload.y;
  state.ghostCards = transformGhostCardsWhenSnapping(
    state,
    action.payload.snap,
    (action as any).ACTOR_REF,
    dropTarget,
    null,
    newEmptyCard
  );
};

const cardMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id: string;
    dx: number;
    dy: number;
    snap: boolean;
    attachLocation: CardAttachLocation;
  }>
> = (state, action) => {
  const movedCards: ICardStack[] = [];
  let primaryCard: ICardStack | null = null;

  state.cards
    .filter(
      (card) => card.dragging && card.controlledBy === (action as any).ACTOR_REF
    )
    .forEach((card) => {
      if (card.id === action.payload.id) {
        primaryCard = card;
      }

      card.x += action.payload.dx;
      card.y += action.payload.dy;

      movedCards.push(card);
    });

  // Not sure why I have to do this typescript....
  primaryCard = primaryCard as ICardStack | null;

  if (
    !!primaryCard &&
    (primaryCard as ICardStack).controlledBy === (action as any).ACTOR_REF
  ) {
    const potentialDropTargetCard = getDropTargetCard(
      state,
      !!primaryCard ? { x: primaryCard.x, y: primaryCard.y } : { x: 0, y: 0 },
      primaryCard.sizeType,
      action.payload.snap
    );

    // Only update the drop target card if the card would actually
    // be different (based on id). Otherwise we'll cause unnecessary
    // re-renders
    const cardStackChanged =
      state.dropTargetCards[(action as any).ACTOR_REF]?.cardStack?.id !==
      potentialDropTargetCard?.cardStack?.id;

    const newLocationXChanged =
      state.dropTargetCards[(action as any).ACTOR_REF]?.playerBoardSlot?.pos
        .x !== potentialDropTargetCard?.playerBoardSlot?.pos.x;

    const newLocationYChanged =
      state.dropTargetCards[(action as any).ACTOR_REF]?.playerBoardSlot?.pos
        .y !== potentialDropTargetCard?.playerBoardSlot?.pos.y;

    if (cardStackChanged || newLocationXChanged || newLocationYChanged) {
      state.dropTargetCards[(action as any).ACTOR_REF] =
        potentialDropTargetCard;
    }
  }

  const canAttachUnder = (
    distance: number,
    card: ICardStack,
    primaryCard: ICardStack | null
  ): boolean => {
    return (
      distance < CARD_ATTACH_TARGET_MAX_DISTANCE &&
      distance > CARD_ATTACH_TARGET_MIN_DISTANCE &&
      card.x < (primaryCard?.x ?? 0) + 50 &&
      card.x > (primaryCard?.x ?? 0) - 50 &&
      card.y < (primaryCard?.y ?? 0)
    );
  };

  const canAttachUpAndRight = (
    distance: number,
    card: ICardStack,
    primaryCard: ICardStack | null
  ): boolean => {
    return (
      distance < CARD_ATTACH_TARGET_MAX_DISTANCE &&
      distance > CARD_ATTACH_TARGET_MIN_DISTANCE &&
      card.x < (primaryCard?.x ?? 0) &&
      card.y > (primaryCard?.y ?? 0)
    );
  };

  const canAttachLeft = (
    distance: number,
    card: ICardStack,
    primaryCard: ICardStack | null
  ): boolean => {
    return (
      distance < CARD_ATTACH_TARGET_MAX_DISTANCE &&
      distance > CARD_ATTACH_TARGET_MIN_DISTANCE &&
      card.x > (primaryCard?.x ?? 0) &&
      card.y > (primaryCard?.y ?? 0) - 50 &&
      card.y < (primaryCard?.y ?? 0) + 50
    );
  };

  const canAttachDownAndLeft = (
    distance: number,
    card: ICardStack,
    primaryCard: ICardStack | null
  ): boolean => {
    return (
      distance < CARD_ATTACH_TARGET_MAX_DISTANCE &&
      distance > CARD_ATTACH_TARGET_MIN_DISTANCE &&
      card.x > (primaryCard?.x ?? 0) &&
      card.y < (primaryCard?.y ?? 0)
    );
  };

  // go through and find if any unselected cards are potential attach targets
  // If so, get the closest one. But only if the card is owned / controlled by us
  const possibleAttachTargets: { distance: number; card: ICardStack }[] = [];
  if (
    !!primaryCard &&
    (primaryCard as ICardStack).controlledBy === (action as any).ACTOR_REF
  ) {
    foreachUnselectedCard(state, (card) => {
      const distance = getDistance(
        !!primaryCard ? { x: primaryCard.x, y: primaryCard.y } : { x: 0, y: 0 },
        { x: card.x, y: card.y }
      );

      let canAttach = false;
      switch (action.payload.attachLocation) {
        case CardAttachLocation.Below:
          canAttach = canAttachUnder(distance, card, primaryCard);
          break;
        case CardAttachLocation.UpAndRight:
          canAttach = canAttachUpAndRight(distance, card, primaryCard);
          break;
        case CardAttachLocation.Left:
          canAttach = canAttachLeft(distance, card, primaryCard);
          break;
        case CardAttachLocation.DownAndLeft:
          canAttach = canAttachDownAndLeft(distance, card, primaryCard);
          break;
        default:
          break;
      }

      if (canAttach) {
        possibleAttachTargets.push({
          distance,
          card,
        });
      }
    });
  }

  const existingAttachTargetCard =
    state.attachTargetCards[(action as any).ACTOR_REF];
  const potentialAttachTargetCard =
    possibleAttachTargets.sort((c1, c2) => c1.distance - c2.distance)[0]
      ?.card ?? null;

  // If either is now null while the other isn't, just assign. Otherwise, check if the id is changing
  if (potentialAttachTargetCard?.id !== existingAttachTargetCard?.id) {
    state.attachTargetCards[(action as any).ACTOR_REF] =
      potentialAttachTargetCard;
  }

  const dropTarget = state.dropTargetCards[(action as any).ACTOR_REF];
  const attachTarget = state.attachTargetCards[(action as any).ACTOR_REF];
  if (!!attachTarget) {
    // First, figure out where we should draw the ghost card. Keep moving
    // until there's not a card there
    const drawPos = getAttachDrawPos(
      state,
      attachTarget,
      action.payload.attachLocation
    );
    // Next, check if there's already a ghost card where we were going to draw
    const existingGhostCard = state.ghostCards.find(
      (gc) =>
        gc.x === drawPos.x &&
        gc.y === drawPos.y &&
        gc.cardStack.length > 0 &&
        gc.cardStack[0].jsonId === "-1"
    );
    if (!existingGhostCard) {
      const attachGhostCard: ICardStack = JSON.parse(
        JSON.stringify(attachTarget)
      );
      // In general we don't want to do this (generate ids in here) but since this is just a temporary ghost card that we won't
      // ever refer to by id, it should be safe.
      attachGhostCard.id = uuidv4();
      attachGhostCard.x = drawPos.x;
      attachGhostCard.y = drawPos.y;
      attachGhostCard.cardStack = [{ jsonId: "-1" }];
      // TODO: Maybe make this smarter so we don't re-render?
      state.ghostCards.push(attachGhostCard);
    }
  } else {
    // remove all 'attachment' ghost cards
    const potentialNewGhostCards = state.ghostCards.filter(
      (gc) => gc.cardStack.length > 0 && gc.cardStack[0].jsonId !== "-1"
    );

    if (
      potentialNewGhostCards.length !== state.ghostCards.length ||
      potentialNewGhostCards.map((c) => c.id).join(",") !==
        state.ghostCards.map((c) => c.id).join(",")
    ) {
      state.ghostCards = potentialNewGhostCards;
    }
  }

  // Create the 'snap guideline' cards if we don't have a drop target or attach target
  const potentialNewGhostCards = transformGhostCardsWhenSnapping(
    state,
    action.payload.snap,
    (action as any).ACTOR_REF,
    dropTarget,
    attachTarget
  );

  if (
    potentialNewGhostCards.length !== state.ghostCards.length ||
    potentialNewGhostCards.map((c) => `${c.id}-${c.x}-${c.y}`).join(",") !==
      state.ghostCards.map((c) => `${c.id}-${c.x}-${c.y}`).join(",")
  ) {
    state.ghostCards = potentialNewGhostCards;
  }

  // put the moved cards at the end. TODO: we could just store the move order or move time
  // or something, and the array could be a selector

  // However, we only want to change the state if something is actually going to change. So if
  // the moving cards are already at the end.... do nothing to the state to avoid re-renders

  if (
    movedCards.some(
      (card, index) =>
        state.cards[state.cards.length - movedCards.length + index].id !==
        card.id
    )
  ) {
    movedCards.forEach((movedCard) => {
      state.cards.push(
        state.cards.splice(state.cards.indexOf(movedCard), 1)[0]
      );
    });
  }
};

const getAttachmentOffset = (
  drawPos: Vector2d,
  index: number,
  location: CardAttachLocation,
  size: CardSizeType
): Vector2d => {
  let result = { x: 0, y: 0 };
  switch (location) {
    case CardAttachLocation.UpAndRight:
      result = {
        x:
          drawPos.x +
          index * cardConstants[size].ATTACHMENT_OFFSET_UP_AND_RIGHT,
        y:
          drawPos.y -
          index * cardConstants[size].ATTACHMENT_OFFSET_UP_AND_RIGHT,
      };
      break;
    case CardAttachLocation.Below:
      result = {
        x: drawPos.x,
        y: drawPos.y + index * cardConstants[size].ATTACHMENT_OFFSET_BELOW,
      };
      break;
    case CardAttachLocation.Left:
      result = {
        x: drawPos.x - index * cardConstants[size].ATTACHMENT_OFFSET_LEFT,
        y: drawPos.y,
      };
      break;
    case CardAttachLocation.DownAndLeft:
      result = {
        x:
          drawPos.x -
          index * cardConstants[size].ATTACHMENT_OFFSET_UP_AND_RIGHT,
        y:
          drawPos.y +
          index * cardConstants[size].ATTACHMENT_OFFSET_UP_AND_RIGHT,
      };
      break;
    default:
      break;
  }

  return result;
};

const endCardMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id: string;
    snap: boolean;
    attachLocation: CardAttachLocation;
  }>
> = (state, action) => {
  let dropTargetCardStacks: ICardStack[] = [];
  let attachTargetCardStacks: ICardStack[] = [];

  const cardsThatWereDragging = state.cards.filter(
    (card) => card.dragging && card.controlledBy === (action as any).ACTOR_REF
  );

  cardsThatWereDragging.forEach((card) => {
    card.dragging = false;

    // GRID SNAPPING
    if (action.payload.snap && !card.attachedTo) {
      card.x =
        Math.round(card.x / cardConstants[card.sizeType].GRID_SNAP_WIDTH) *
        cardConstants[card.sizeType].GRID_SNAP_WIDTH;
      card.y =
        Math.round(card.y / cardConstants[card.sizeType].GRID_SNAP_HEIGHT) *
        cardConstants[card.sizeType].GRID_SNAP_HEIGHT;
    }
    if (!!state.attachTargetCards[(action as any).ACTOR_REF]) {
      attachTargetCardStacks.push(card);
    } else if (!!state.dropTargetCards[(action as any).ACTOR_REF]) {
      // Add the cards to the drop Target card stack
      dropTargetCardStacks = dropTargetCardStacks.concat(card);
    }
  });

  let attachTarget = state.attachTargetCards[(action as any).ACTOR_REF];
  let attachTargetCardFromState = state.cards.find(
    (c) => c.id === attachTarget?.id
  );

  // If we are about to attach to a card that's already attached to something else,
  // get the base card
  for (
    let checkAttachedTo = attachTargetCardFromState?.attachedTo;
    !!checkAttachedTo;
    checkAttachedTo = attachTargetCardFromState?.attachedTo
  ) {
    attachTargetCardFromState = state.cards.find(
      (c) => c.id === checkAttachedTo
    );
    attachTarget = attachTargetCardFromState ?? null;
  }

  if (!!attachTarget && !!attachTargetCardFromState) {
    const drawPos = getAttachDrawPos(
      state,
      attachTarget,
      action.payload.attachLocation
    );
    attachTargetCardStacks.forEach((cs, index) => {
      const attachOffset = getAttachmentOffset(
        drawPos,
        index,
        action.payload.attachLocation,
        cs.sizeType
      );

      cs.x = attachOffset.x;
      cs.y = attachOffset.y;

      removeAttachedCard(state, cs);

      // I don't know why I have to do this conditional check...
      if (attachTargetCardFromState && attachTarget) {
        cs.attachedTo = attachTarget.id;
        attachTargetCardFromState.attachedCardIds = addAttachedCard(
          attachTargetCardFromState,
          cs
        );
        state.cards.unshift(state.cards.splice(state.cards.indexOf(cs), 1)[0]);
      } else {
        log.error("How did this happen??");
      }
    });
    // Now, if there was a drop target card (and an actual card stack), remove all those cards from the state
  } else if (!!state.dropTargetCards[(action as any).ACTOR_REF]?.cardStack) {
    state.cards = state.cards.filter(
      (card) =>
        !(
          card.id === action.payload.id ||
          (card.selected && card.controlledBy === (action as any).ACTOR_REF)
        )
    );

    const dropTargetCard = state.cards.find(
      (card) =>
        card.id ===
        state.dropTargetCards[(action as any).ACTOR_REF]?.cardStack?.id
    );
    if (!!dropTargetCard && dropTargetCardStacks.length > 0) {
      // add the cards we've collected to the top of the stack
      const cardsCollected = dropTargetCardStacks.reduce(
        (collected, card) => collected.concat(card.cardStack),
        [] as ICardDetails[]
      );

      dropTargetCard.cardStack = cardsCollected.concat(
        dropTargetCard.cardStack
      );
    }
  } else if (
    !!state.dropTargetCards[(action as any).ACTOR_REF]?.playerBoardSlot
  ) {
    const playerBoardId =
      state.dropTargetCards[(action as any).ACTOR_REF]?.playerBoardSlot
        ?.boardId;
    const slot =
      state.dropTargetCards[(action as any).ACTOR_REF]?.playerBoardSlot;
    // we need to add all the dragging cards to a single stack in the new location.
    // grab the first cardStack from our dropTargets to use as the "base"
    const newBaseStack = dropTargetCardStacks.shift();
    if (!!newBaseStack && slot) {
      // Remove all the _other_ moving cards
      state.cards = state.cards.filter(
        (card) => !dropTargetCardStacks.find((c) => c.id === card.id)
      );

      // Set it to the new location
      newBaseStack.x = slot.pos.x;
      newBaseStack.y = slot.pos.y;

      // If it's lanscape make sure the new base stack is exhausted
      newBaseStack.exhausted = slot.landscape;

      // add the cards we've collected to the top of the stack
      const cardsCollected = dropTargetCardStacks.reduce(
        (collected, card) => collected.concat(card.cardStack),
        [] as ICardDetails[]
      );

      newBaseStack.cardStack = cardsCollected.concat(newBaseStack.cardStack);

      // make sure the new base stack is one of the ones on the playerboard
      const attachingToBoard = state.playerBoards.find(
        (pb) => pb.id === playerBoardId
      );
      attachingToBoard?.attachedStackIds.push(newBaseStack.id);
    }
  }

  // Now move any attached cards
  cardsThatWereDragging.forEach((card) => {
    if (!!card.attachedCardIds) {
      card.attachedCardIds.forEach((aCId, index) => {
        const attachedCard = cardsThatWereDragging.find((c) => c.id === aCId);

        if (!attachedCard) {
          log.error(
            `Card ${card.id} said card ${aCId} was attached, but we couldn't find it in the cards that had been dragging`
          );
          return;
        }

        const attachOffset = getAttachmentOffset(
          { x: card.x, y: card.y },
          index + 1,
          action.payload.attachLocation,
          card.sizeType
        );

        attachedCard.x = attachOffset.x;
        attachedCard.y = attachOffset.y;
      });
    }
  });

  state.ghostCards = [];
  state.dropTargetCards[(action as any).ACTOR_REF] = null;
  state.attachTargetCards[(action as any).ACTOR_REF] = null;
};

const selectMultipleCardsReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ ids: string[]; unselectOtherCards?: boolean }>
> = (state, action) => {
  // first, if we were told to unselect our other cards, do that
  if (!!action.payload.unselectOtherCards) {
    unselectAllCardsReducer(state, action as unknown as any);
  }

  action.payload.ids
    .map((id) => state.cards.find((card) => card.id === id))
    .forEach((card) => {
      if (
        card &&
        (card.controlledBy === "" ||
          card.controlledBy === (action as any).ACTOR_REF)
      ) {
        card.selected = true;
        card.controlledBy = (action as any).ACTOR_REF;
      }
    });
};

const unselectAllCardsReducer: CaseReducer<ICardsState, PayloadAction<any>> = (
  state,
  action
) => {
  state.cards
    .filter(
      (card) =>
        card.controlledBy === "" ||
        card.controlledBy === (action as any).ACTOR_REF
    )
    .forEach((card) => {
      card.selected = false;
      card.controlledBy = "";
    });
};

const togglePanModeReducer: CaseReducer<ICardsState> = (state) => {
  state.panMode = !state.panMode;
};

const toggleMultiselectModeReducer: CaseReducer<ICardsState> = (state) => {
  state.multiselectMode = !state.multiselectMode;
};

const flipCardsReducer: CaseReducer<ICardsState> = (state, action) => {
  state.cards
    .filter(
      (card) =>
        card.selected &&
        (card.controlledBy === "" ||
          card.controlledBy === (action as any).ACTOR_REF)
    )
    .forEach((card) => {
      card.faceup = !card.faceup;
      card.cardStack = card.cardStack.reverse();
    });
};

const resetCardsReducer: CaseReducer<ICardsState> = (state) => {
  state.cards = [];
  state.playerHands = generateDefaultPlayerHands();
  state.playerBoards = [];
  state.tableCardSlots = [];
};

const toggleTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id?: string; tokenType: StatusTokenType; value?: boolean }>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    if (action.payload.value !== undefined) {
      card.statusTokens[action.payload.tokenType] = action.payload.value
        ? 1
        : 0;
    } else {
      card.statusTokens[action.payload.tokenType] = !card.statusTokens[
        action.payload.tokenType
      ]
        ? 1
        : 0;
    }
  });
};

const adjustStatusTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    tokenType: StatusTokenType;
    delta: number;
  }>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    card.statusTokens[action.payload.tokenType] += action.payload.delta;

    if (card.statusTokens[action.payload.tokenType] < 0) {
      card.statusTokens[action.payload.tokenType] = 0;
    }
  });
};

const adjustCounterTokenWithMaxReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id?: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
    max?: number;
  }>
> = (state, action) => {
  const valueToUse =
    action.payload.value !== undefined && action.payload.max !== undefined
      ? Math.min(action.payload.value, action.payload.max)
      : action.payload.value;

  let cardsToToggle = state.cards.filter(
    (c) =>
      (!!action.payload.id && action.payload.id === c.id) ||
      (c.selected && c.controlledBy === (action as any).ACTOR_REF)
  );

  cardsToToggle.forEach((c) => {
    if (valueToUse !== undefined) {
      c.counterTokens[action.payload.tokenType] = valueToUse;
    } else if (action.payload.delta !== undefined) {
      if (
        c.counterTokens[action.payload.tokenType] === null ||
        c.counterTokens[action.payload.tokenType] === undefined
      ) {
        c.counterTokens[action.payload.tokenType] = 0;
      }
      c.counterTokens[action.payload.tokenType] += action.payload.delta;

      //Adjust if there's a max
      if (
        action.payload.max !== undefined &&
        c.counterTokens[action.payload.tokenType] > action.payload.max
      ) {
        c.counterTokens[action.payload.tokenType] = action.payload.max;
      }
    }

    if (c.counterTokens[action.payload.tokenType] < 0) {
      c.counterTokens[action.payload.tokenType] = 0;
    }
  });
};

const adjustModifierReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id?: string;
    modifierId: string;
    delta?: number;
    value?: number;
  }>
> = (state, action) => {
  let cardsToToggle = state.cards.filter(
    (c) =>
      (!!action.payload.id && action.payload.id === c.id) ||
      (c.selected && c.controlledBy === (action as any).ACTOR_REF)
  );

  cardsToToggle.forEach((c) => {
    if (action.payload.value !== undefined) {
      c.modifiers[action.payload.modifierId] = action.payload.value;
    } else if (action.payload.delta !== undefined) {
      if (c.modifiers[action.payload.modifierId] === undefined) {
        c.modifiers[action.payload.modifierId] = 0;
      }
      c.modifiers[action.payload.modifierId] += action.payload.delta;
    }
  });
};

const clearAllModifiersReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id?: string;
  }>
> = (state, action) => {
  let cardsToToggle = state.cards.filter(
    (c) =>
      (!!action.payload.id && action.payload.id === c.id) ||
      (c.selected && c.controlledBy === (action as any).ACTOR_REF)
  );

  cardsToToggle.forEach((c) => {
    c.modifiers = {};
    c.extraIcons = [];
  });
};

const setPlayerRoleReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
    role: string | null;
  }>
> = (state, action) => {
  const playerIndex = action.payload.playerNumber - 1;
  if (playerIndex < 0 || playerIndex >= state.playerHands.length) {
    log.error(
      `Got an invalid playerNumber: ${action.payload.playerNumber}. PlayerHands length is ${state.playerHands.length}`
    );
    return;
  }

  const playerHand = state.playerHands[playerIndex];
  playerHand.role = action.payload.role;
};

const clearPlayerRoleReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
  }>
> = (state, action) => {
  const playerIndex = action.payload.playerNumber - 1;
  if (playerIndex < 0 || playerIndex >= state.playerHands.length) {
    log.error(
      `Got an invalid playerNumber: ${action.payload.playerNumber}. PlayerHands length is ${state.playerHands.length}`
    );
    return;
  }

  const playerHand = state.playerHands[playerIndex];
  playerHand.role = null;
};

const addToPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
  }>
> = (state, action) => {
  const playerIndex = action.payload.playerNumber - 1;
  if (playerIndex < 0 || playerIndex >= state.playerHands.length) {
    log.error(
      `Got an invalid playerNumber: ${action.payload.playerNumber}. PlayerHands length is ${state.playerHands.length}`
    );
    return;
  }

  const playerHand = state.playerHands[playerIndex];

  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    state.playerHands[playerIndex].cards = card.cardStack
      .map((id) => ({ faceup: true, cardDetails: id }))
      .concat(playerHand.cards);
  });

  deleteCardStackReducer(state, {
    ACTOR_REF: (action as any).ACTOR_REF,
    payload: undefined,
    type: deleteCardStack.type,
  } as any);
};

const reorderPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
    sourceIndeces: number[];
    destinationIndex: number;
  }>
> = (state, action) => {
  if (state.playerHands.length >= action.payload.playerNumber) {
    const hand = state.playerHands[action.payload.playerNumber - 1];

    let result = [] as IPlayerHandCard[];
    // go through the original, up to the index where we want to insert, and grab
    // items that aren't being removed

    // console.log(
    //   `moving indeces ${action.payload.sourceIndeces} to ${action.payload.destinationIndex}`
    // );

    const excludeFinalIndex = action.payload.sourceIndeces.every(
      (i) => i > action.payload.destinationIndex
    );

    for (
      let i = 0;
      i <=
      (excludeFinalIndex
        ? action.payload.destinationIndex - 1
        : action.payload.destinationIndex);
      i++
    ) {
      if (!action.payload.sourceIndeces.includes(i)) {
        // console.log(`adding index ${i} to result`);
        result.push(hand.cards[i]);
      }
    }

    // now add the other items in the order they were in the source array
    action.payload.sourceIndeces.sort().forEach((i) => {
      // console.log(`adding moved card index ${i} to result`);
      result.push(hand.cards[i]);
    });

    const start = excludeFinalIndex
      ? action.payload.destinationIndex
      : action.payload.destinationIndex + 1;

    // now add the rest of the cards that aren't being moved
    if (action.payload.destinationIndex < hand.cards.length - 1) {
      for (let i = start; i < hand.cards.length; i++) {
        if (!action.payload.sourceIndeces.includes(i)) {
          // console.log(`adding index ${i} to result (leftover)`);
          result.push(hand.cards[i]);
        }
      }
    }

    hand.cards = result;
  }
};

const removeFromPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
    indeces: number[];
  }>
> = (state, action) => {
  console.log("REMOVING FROM PLAYER HAND");
  if (state.playerHands.length >= action.payload.playerNumber) {
    const hand = state.playerHands[action.payload.playerNumber - 1];
    const result = hand.cards.filter(
      (_c, index) => !action.payload.indeces.includes(index)
    );
    hand.cards = result;
  }
};

const flipInPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
    indeces: number[];
  }>
> = (state, action) => {
  if (state.playerHands.length >= action.payload.playerNumber) {
    const hand = state.playerHands[action.payload.playerNumber - 1];
    hand.cards.forEach((c, index) => {
      if (action.payload.indeces.includes(index)) {
        c.faceup = !c.faceup;
      }
    });
  }
};

const addToExistingCardStackReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    existingStackId: string;
    cardJsonIds: string[];
  }>
> = (state, action) => {
  let existingStack =
    state.cards.filter((c) => c.id === action.payload.existingStackId)[0] ??
    null;
  if (existingStack) {
    existingStack.cardStack = action.payload.cardJsonIds
      .map((id) => ({ jsonId: id }))
      .concat(existingStack.cardStack);
  }

  state.dropTargetCards[(action as any).ACTOR_REF] = null;
};

const addExtraIconReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    if (!card.extraIcons.includes(action.payload)) {
      card.extraIcons.push(action.payload);
    }
  });
};

const removeExtraIconReducer: CaseReducer<
  ICardsState,
  PayloadAction<string>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    if (card.extraIcons.includes(action.payload)) {
      card.extraIcons.splice(card.extraIcons.indexOf(action.payload), 1);
    }
  });
};

const toggleExtraIconReducer: CaseReducer<
  ICardsState,
  PayloadAction<string>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    if (card.extraIcons.includes(action.payload)) {
      card.extraIcons.splice(card.extraIcons.indexOf(action.payload), 1);
    } else {
      card.extraIcons.push(action.payload);
    }
  });
};

const clearMyGhostCardsReducer: CaseReducer<ICardsState> = (state, action) => {
  state.ghostCards = state.ghostCards.filter(
    (gc) => gc.controlledBy !== (action as any).ACTOR_REF
  );
};

const movePlayerBoardReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; newPos: Vector2d }>
> = (state, action) => {
  const board = state.playerBoards.find((pb) => pb.id === action.payload.id);

  if (!!board) {
    const deltaX = action.payload.newPos.x - board.x;
    const deltaY = action.payload.newPos.y - board.y;

    board.x = action.payload.newPos.x;
    board.y = action.payload.newPos.y;

    // Go through all the attached cards in slots and update their position
    state.cards.forEach((c) => {
      if (board.attachedStackIds.includes(c.id)) {
        c.x += deltaX;
        c.y += deltaY;
      }
    });
  }
};

const createNewPlayerBoardsReducer: CaseReducer<
  ICardsState,
  PayloadAction<IPlayerBoard[]>
> = (state, action) => {
  if (state.playerBoards === undefined || state.playerBoards === null) {
    state.playerBoards = [];
  }

  state.playerBoards = state.playerBoards.concat(action.payload);
};

// slice
const cardsSlice = createSlice({
  name: "cards",
  initialState: initialState,
  reducers: {
    selectCard: selectCardReducer,
    unselectCard: unselectCardReducer,
    toggleSelectCard: toggleSelectCardReducer,
    exhaustCard: exhaustCardReducer,
    exhaustAllCards: exhaustAllCardsReducer,
    deleteCardStack: deleteCardStackReducer,
    cardMoveWithSnap: cardMoveWithSnapReducer,
    endCardMoveWithSnap: endCardMoveWithSnapReducer,
    cardFromHandMoveWithSnap: cardFromHandMoveWithSnapReducer,
    selectMultipleCards: selectMultipleCardsReducer,
    unselectAllCards: unselectAllCardsReducer,
    togglePanMode: togglePanModeReducer,
    toggleMultiselectMode: toggleMultiselectModeReducer,
    flipCards: flipCardsReducer,
    resetCards: resetCardsReducer,
    toggleToken: toggleTokenReducer,
    adjustCounterTokenWithMax: adjustCounterTokenWithMaxReducer,
    adjustStatusToken: adjustStatusTokenReducer,
    adjustModifier: adjustModifierReducer,
    clearAllModifiers: clearAllModifiersReducer,
    clearCardTokens: clearCardTokensReducer,
    reorderPlayerHand: reorderPlayerHandReducer,
    removeFromPlayerHand: removeFromPlayerHandReducer,
    flipInPlayerHand: flipInPlayerHandReducer,
    addToPlayerHand: addToPlayerHandReducer,
    setPlayerRole: setPlayerRoleReducer,
    clearPlayerRole: clearPlayerRoleReducer,
    addToExistingCardStack: addToExistingCardStackReducer,
    addExtraIcon: addExtraIconReducer,
    removeExtraIcon: removeExtraIconReducer,
    toggleExtraIcon: toggleExtraIconReducer,
    clearMyGhostCards: clearMyGhostCardsReducer,
    movePlayerBoard: movePlayerBoardReducer,
    createNewPlayerBoards: createNewPlayerBoardsReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // TODO: find a way to keep this automatic
      state.cards = action.payload.liveState.present.cards.cards;
      state.ghostCards = action.payload.liveState.present.cards.ghostCards;
      state.playerHands = action.payload.liveState.present.cards.playerHands;
    });

    builder.addCase(verifyRemoteGameState, (state, action) => {
      const cardsThatArentDragging = original(state.cards)?.filter(
        (c) => !c.dragging
      );
      const remoteCardsThatArentDragging =
        action.payload.liveState.present.cards.cards.filter((c) => !c.dragging);

      const cardsInSync = isEqual(
        cardsThatArentDragging,
        remoteCardsThatArentDragging
      );

      // const ghostCardsInSync = isEqual(
      //   original(state.ghostCards),
      //   action.payload.liveState.present.cards.ghostCards
      // );

      const playerHandsInSync = isEqual(
        original(state.playerHands),
        action.payload.liveState.present.cards.playerHands
      );

      state.outOfSyncWithRemoteCount =
        cardsInSync &&
        // ghostCardsInSync &&
        playerHandsInSync
          ? 0
          : state.outOfSyncWithRemoteCount + 1;
      if (state.outOfSyncWithRemoteCount >= COUNT_OUT_OF_SYNC_THRESHOLD) {
        if (!cardsInSync) {
          log.error(
            "CARDS state is out of sync with remote!!!",
            JSON.stringify(cardsThatArentDragging),
            "\n\n********************\n\n",
            JSON.stringify(remoteCardsThatArentDragging)
          );
        }

        if (!playerHandsInSync) {
          log.error(
            "PLAYER HANDS state is out of sync with remote!!!",
            JSON.stringify(original(state.playerHands)),
            "\n\n********************\n\n",
            JSON.stringify(action.payload.liveState.present.cards.playerHands)
          );
        }
      } else {
        log.debug("CARDS state is in sync");
      }
    });

    builder.addCase(replaceCardStack, (state, action) => {
      const cardToReplaceStack = state.cards.find(
        (c) => c.id === action.payload.id
      );
      if (!!cardToReplaceStack) {
        cardToReplaceStack.cardStack = action.payload.newStack;
      }
    });

    builder.addCase(resetApp, (state) => {
      state.cards = [];
      state.playerBoards = [];
      state.playerHands = generateDefaultPlayerHands();
      // state.previewCard = null;
      state.dropTargetCards = {};
      state.ghostCards = [];
      state.panMode = true;
    });

    builder.addCase(updateActiveGameType, (state, action) => {
      state.tableCardSlots =
        GameManager.getModuleForType(action.payload).properties
          .tableCardSlots ?? [];
    });

    builder.addCase(addCardStackWithSnapAndId, (state, action) => {
      const sizeType = action.payload.sizeType;

      const x = action.payload.snap
        ? Math.round(
            action.payload.position.x / cardConstants[sizeType].GRID_SNAP_WIDTH
          ) * cardConstants[sizeType].GRID_SNAP_WIDTH
        : action.payload.position.x;

      const y = action.payload.snap
        ? Math.round(
            action.payload.position.y / cardConstants[sizeType].GRID_SNAP_HEIGHT
          ) * cardConstants[sizeType].GRID_SNAP_HEIGHT
        : action.payload.position.y;

      const newStack: ICardStack = {
        controlledBy: "",
        x,
        y,
        dragging: false,
        shuffling: false,
        exhausted: false,
        faceup: action.payload.faceup === undefined || !!action.payload.faceup,
        fill: "red",
        id: action.payload.id,
        cardStack: action.payload.cardJsonIds.map((jsonId) => ({
          jsonId,
        })),
        selected: false,
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
        sizeType,
      };

      state.cards.push(newStack);
    });

    builder.addCase(addCardStackToPlayerBoardWithId, (state, action) => {
      const sizeType = action.payload.sizeType;

      const newStack: ICardStack = {
        controlledBy: "",
        x: action.payload.slot.pos.x,
        y: action.payload.slot.pos.y,
        dragging: false,
        shuffling: false,
        exhausted: action.payload.slot.landscape,
        faceup: action.payload.faceup === undefined || !!action.payload.faceup,
        fill: "red",
        id: action.payload.id,
        cardStack: action.payload.cardJsonIds.map((jsonId) => ({
          jsonId,
        })),
        selected: false,
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
        sizeType,
      };

      state.cards.push(newStack);

      state.playerBoards
        .find((pb) => pb.id === action.payload.slot.boardId)
        ?.attachedStackIds.push(action.payload.id);
    });

    builder.addCase(pullCardOutOfCardStackWithId, (state, action) => {
      const cardStackToUse = state.cards.find(
        (c) => c.id === action.payload.cardStackId
      );
      if (!!cardStackToUse && cardStackToUse.cardStack.length > 1) {
        const newCardStack: ICardDetails[] = [
          { jsonId: action.payload.jsonId },
        ];
        const newCard = Object.assign({}, cardStackToUse, {
          cardStack: newCardStack,
        });
        newCard.id = action.payload.id;
        newCard.selected = true;
        newCard.controlledBy = (action as any).ACTOR_REF;
        newCard.x =
          newCard.x + cardConstants[cardStackToUse.sizeType].GRID_SNAP_WIDTH;

        // Find the first instance of the card with the json id. Note that because there
        // might be multiple cards with the same json id, we can't just do a filter
        const cardIndexToRemove = cardStackToUse.cardStack.findIndex(
          (c) => c.jsonId === action.payload.jsonId
        );

        if (cardIndexToRemove !== -1) {
          cardStackToUse.cardStack.splice(cardIndexToRemove, 1);
        }

        cardStackToUse.selected = false;
        cardStackToUse.controlledBy = "";

        state.cards.push(newCard);
      }
    });

    builder.addCase(startCardMoveWithSplitStackId, (state, action) => {
      // first, if the card moving isn't currently selected, clear all _our_ selected cards
      const cardToStartMoving = getCardStackWithId(state, action.payload.id);
      if (cardToStartMoving && !cardToStartMoving.selected) {
        state.cards = state.cards.map((card) => {
          if (
            card.controlledBy === "" ||
            card.controlledBy === (action as any).ACTOR_REF
          ) {
            card.selected = card.id === action.payload.id;
            if (card.selected) {
              card.controlledBy = (action as any).ACTOR_REF;
            } else {
              card.controlledBy = "";
            }
          }
          return card;
        });
      }

      // If we are splitting, make a new stack of cards
      if (action.payload.splitTopCard) {
        const cardToMove = state.cards.find((c) => c.id === action.payload.id);

        if (!cardToMove) {
          throw new Error("Expected to find card");
        }

        cardToMove.selected = false;
        cardToMove.controlledBy = "";

        const topCard = cardToMove.cardStack.shift();
        const newCard = Object.assign({}, cardToMove, {
          selected: true,
          controlledBy: (action as any).ACTOR_REF,
          dragging: true,
          cardStack: [topCard],
        });

        cardToMove.id = action.payload.splitCardId;

        state.cards.push(newCard);
      }

      // Now all selected cards should be put into ghost cards, unless we are splitting the top card
      state.ghostCards = [];

      if (!action.payload.splitTopCard) {
        foreachSelectedAndControlledCard(
          state,
          (action as any).ACTOR_REF,
          (card) => {
            // since we're not splitting, remove the card from all player boards
            state.playerBoards.forEach((pb) => {
              if (pb.attachedStackIds.includes(card.id)) {
                pb.attachedStackIds = pb.attachedStackIds.filter(
                  (id) => id !== card.id
                );
              }
            });

            card.dragging = true;

            // if the card has other attached cards, select them and drag them
            if (!!card.attachedCardIds && card.attachedCardIds.length > 0) {
              state.cards
                .filter((c) => card.attachedCardIds?.some((aC) => aC === c.id))
                .forEach((card) => {
                  card.dragging = true;
                  card.selected = true;
                  card.controlledBy = (action as any).ACTOR_REF;
                });
            }
            state.ghostCards.push(Object.assign({}, card));
          }
        );

        const draggingCards = state.cards.filter(
          (card) =>
            card.dragging && card.controlledBy === (action as any).ACTOR_REF
        );

        // Now deal with attached cards. If a card was attached, but the base card it was
        // attached to isn't moving, clear the 'attached' details. Note that we have to do
        // this after everything else because we only want to clear an attached card if the
        // base card isn't also moving
        foreachSelectedAndControlledCard(
          state,
          (action as any).ACTOR_REF,
          (card) => {
            // If the card was attached to something, but that something isn't also dragging
            if (
              !!card.attachedTo &&
              !draggingCards.some((c) => c.id === card.attachedTo)
            ) {
              log.debug(
                card.cardStack[0].jsonId +
                  " isn't attached any more, removing from " +
                  card.attachedTo
              );
              removeAttachedCard(state, card);
            }
          }
        );
      }

      //Finally, if we have a preview card, clear it
      // state.previewCard = null;
    });

    builder.addCase(drawCardsOutOfCardStackWithIds, (state, action) => {
      if (action.payload.numberToDraw !== action.payload.idsToUse.length) {
        throw new Error("Did not receive the expected number of ids");
      }

      // First, unselect everything else of ours
      unselectAllCardsReducer(state, action as unknown as any);

      // Get the cardstack in question
      let cardStackToUse = state.cards.find(
        (c) => c.id === action.payload.cardStackId
      );

      if (!cardStackToUse) {
        throw new Error(
          `Couldn't find card stack with id ${action.payload.cardStackId}`
        );
      }

      const sourceCardStackId = cardStackToUse.id;

      //Next, for each card we should draw, remove it from the stack and make a new stack, which should be selected
      // In the case that we're told to draw it into our hand, we don't need to make
      // any new stacks
      for (let index = 0; index < action.payload.numberToDraw; index++) {
        if (!!cardStackToUse) {
          const topCardDetails = cardStackToUse.cardStack.shift();
          if (!topCardDetails) {
            throw new Error("Expected to find a top card, but didn't");
          }
          if (action.payload.drawIntoHand) {
            const playerIndex = action.payload.playerNumber - 1;
            state.playerHands[playerIndex].cards.push({
              faceup: true,
              cardDetails: {
                jsonId: topCardDetails.jsonId,
              },
            });
          } else {
            const newCardStack: ICardDetails[] = [
              { jsonId: topCardDetails.jsonId },
            ];
            const newCard = Object.assign({}, cardStackToUse, {
              cardStack: newCardStack,
            });
            newCard.id = action.payload.idsToUse[index];
            newCard.selected = true;
            newCard.controlledBy = (action as any).ACTOR_REF;
            newCard.faceup = !action.payload.facedown;
            newCard.x =
              newCard.x +
              cardConstants[cardStackToUse.sizeType].GRID_SNAP_WIDTH *
                (index + 1);
            newCard.y += cardConstants[cardStackToUse.sizeType].CARD_HEIGHT;

            state.cards.push(newCard);
          }

          if (cardStackToUse.cardStack.length === 0) {
            // we went through all the cards, remove the original card
            state.cards = state.cards.filter((c) => c.id !== sourceCardStackId);
            cardStackToUse = undefined;
          }
        }
      }
    });

    builder.addCase(setStackShuffling, (state, action) => {
      // get the stack to update
      const stackToUpdate = state.cards.find((c) => c.id === action.payload.id);

      if (!!stackToUpdate) {
        stackToUpdate.shuffling = action.payload.shuffling;
      }
    });

    builder.addCase(createDeckFromTextFileWithIds, (state, action) =>
      handleLoadDeck(state, action)
    );

    builder.addCase(fetchDecklistById.fulfilled, (state, action) =>
      handleLoadDeck(state, action)
    );

    builder.addCase(startDraggingCardFromHand, (state, action) => {
      // Clear all our selected cards
      unselectAllCardsReducer(state, action as unknown as any);
    });
  },
});

const handleLoadDeck = (
  state: Draft<ICardsState>,
  action: PayloadAction<CreateDeckPayload>
) => {
  log.debug("got decklist");
  log.debug(action);

  const potentialHeroCard: ICardDetails[] = action.payload.data
    .investigator_code
    ? [{ jsonId: action.payload.data.investigator_code }]
    : [];

  const heroCardStack = [
    ...potentialHeroCard,
    ...action.payload.extraHeroCards,
  ];

  const heroCard: ICardStack = {
    controlledBy: (action as any).ACTOR_REF,
    selected: true,
    x: action.payload.position.x,
    y: action.payload.position.y,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "red",
    id: action.payload.heroId,
    cardStack: heroCardStack,
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

  let mainDeckStack: ICardDetails[] = [];
  Object.entries(action.payload.data.slots).forEach(([key, value]) => {
    const cardDetails: ICardDetails[] = Array.from(Array(value).keys()).map(
      (): ICardDetails => ({ jsonId: key })
    );
    mainDeckStack = mainDeckStack.concat(cardDetails);
  });

  const cardPadding = cardConstants[CardSizeType.Standard].GRID_SNAP_WIDTH;

  const newDeck: ICardStack = {
    controlledBy: (action as any).ACTOR_REF,
    selected: true,
    x: action.payload.position.x + cardPadding,
    y: action.payload.position.y,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "red",
    id: action.payload.dataId,
    cardStack: mainDeckStack,
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

  const encounterDeck: ICardStack = {
    controlledBy: (action as any).ACTOR_REF,
    selected: true,
    x: action.payload.position.x + cardPadding * 2,
    y: action.payload.position.y,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "red",
    id: action.payload.encounterDeckId,
    cardStack: action.payload.relatedEncounterDeck.map((jsonId) => ({
      jsonId,
    })),
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

  const obligationDeck: ICardStack = {
    controlledBy: (action as any).ACTOR_REF,
    selected: true,
    x: action.payload.position.x + cardPadding * 3,
    y: action.payload.position.y,
    dragging: false,
    shuffling: false,
    exhausted: false,
    faceup: true,
    fill: "red",
    id: action.payload.obligationDeckId,
    cardStack: action.payload.relatedObligationDeck.map((jsonId) => ({
      jsonId,
    })),
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

  if (heroCard.cardStack.length > 0) {
    state.cards.push(heroCard);
  }

  if (newDeck.cardStack.length > 0) {
    state.cards.push(newDeck);
  }

  if (encounterDeck.cardStack.length > 0) {
    state.cards.push(encounterDeck);
  }

  if (obligationDeck.cardStack.length > 0) {
    state.cards.push(obligationDeck);
  }
};

export const {
  selectCard,
  unselectCard,
  toggleSelectCard,
  exhaustCard,
  exhaustAllCards,
  deleteCardStack,
  cardMoveWithSnap,
  endCardMoveWithSnap,
  cardFromHandMoveWithSnap,
  selectMultipleCards,
  unselectAllCards,
  togglePanMode,
  toggleMultiselectMode,
  flipCards,
  resetCards,
  toggleToken,
  adjustStatusToken,
  adjustCounterTokenWithMax,
  clearCardTokens,
  adjustModifier,
  clearAllModifiers,
  reorderPlayerHand,
  removeFromPlayerHand,
  flipInPlayerHand,
  addToPlayerHand,
  setPlayerRole,
  clearPlayerRole,
  addToExistingCardStack,
  addExtraIcon,
  removeExtraIcon,
  toggleExtraIcon,
  clearMyGhostCards,
  movePlayerBoard,
  createNewPlayerBoards,
} = cardsSlice.actions;

export default cardsSlice.reducer;
