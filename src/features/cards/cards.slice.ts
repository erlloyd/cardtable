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
  cardConstants,
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
  ICardsState,
  ICardStack,
  initialState,
} from "./initialState";
import { myPeerRef } from "../../constants/app-constants";

const CARD_DROP_TARGET_DISTANCE = 30;
const CARD_ATTACH_TARGET_MIN_DISTANCE = 50;
const CARD_ATTACH_TARGET_MAX_DISTANCE = 150;

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
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
    extraIcons: [],
  };
};

const transformGhostCardsWhenSnapping = (
  state: ICardsState,
  shouldSnap: boolean,
  actorRef: string,
  hasDropTarget: boolean,
  hasAttachTarget: boolean,
  card?: ICardStack
): ICardStack[] => {
  let returnCards: ICardStack[] = state.ghostCards;
  if (shouldSnap && !hasDropTarget && !hasAttachTarget) {
    if (!!card && !card.attachedTo) {
      //////////
      ////TODO: Figure out how to generalize this
      //////////
      const snapCard = JSON.parse(JSON.stringify(card));
      snapCard.id = `${card.id}-grid`;
      snapCard.x =
        Math.round(card.x / cardConstants.GRID_SNAP_WIDTH) *
        cardConstants.GRID_SNAP_WIDTH;
      snapCard.y =
        Math.round(card.y / cardConstants.GRID_SNAP_HEIGHT) *
        cardConstants.GRID_SNAP_HEIGHT;
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
          Math.round(card.x / cardConstants.GRID_SNAP_WIDTH) *
          cardConstants.GRID_SNAP_WIDTH;
        snapCard.y =
          Math.round(card.y / cardConstants.GRID_SNAP_HEIGHT) *
          cardConstants.GRID_SNAP_HEIGHT;
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
  } else if (shouldSnap && (hasDropTarget || hasAttachTarget)) {
    // remove all snap cards
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
  allowedDistance: number = CARD_DROP_TARGET_DISTANCE
): ICardStack | null => {
  // go through and find if any unselected cards are potential drop targets
  // If so, get the closest one. But only if the card is owned / controlled by us
  const possibleDropTargets: { distance: number; card: ICardStack }[] = [];

  foreachUnselectedCard(state, (card) => {
    const distance = getDistance({ x: card.x, y: card.y }, draggedCardPosition);
    if (distance < allowedDistance) {
      possibleDropTargets.push({
        distance,
        card,
      });
    }
  });

  return (
    possibleDropTargets.sort((c1, c2) => c1.distance - c2.distance)[0]?.card ??
    null
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
        tough: false,
        stunned: false,
        confused: false,
      };

      card.counterTokens = {
        damage: 0,
        threat: 0,
        generic: 0,
      };

      card.modifiers = {};
      card.extraIcons = [];
    });
};

const getAttachDrawPos = (
  state: Draft<ICardsState>,
  baseCard: ICardStack
): Vector2d => {
  let drawPos = { x: 0, y: 0 };
  let takenSpace = true;
  for (let i = 0; takenSpace; i++) {
    const xToDraw = baseCard.x + (i + 1) * 50;
    const yToDraw = baseCard.y - (i + 1) * 50;

    drawPos = { x: xToDraw, y: yToDraw };

    //Check for existing card
    takenSpace = !!state.cards.find((c) => c.x === xToDraw && c.y === yToDraw);
  }
  return drawPos;
};

const cardFromHandMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ x: number; y: number; snap: boolean }>
> = (state, action) => {
  state.dropTargetCards[(action as any).ACTOR_REF] = getDropTargetCard(
    state,
    action.payload,
    CARD_DROP_TARGET_DISTANCE * 2
  );

  const dropTarget = state.dropTargetCards[(action as any).ACTOR_REF];

  const newEmptyCard = createNewEmptyCardStackWithId(`${myPeerRef}-fromHand`);
  newEmptyCard.x = action.payload.x;
  newEmptyCard.y = action.payload.y;
  state.ghostCards = transformGhostCardsWhenSnapping(
    state,
    action.payload.snap,
    (action as any).ACTOR_REF,
    !!dropTarget,
    false,
    newEmptyCard
  );
};

const cardMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; dx: number; dy: number; snap: boolean }>
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
    state.dropTargetCards[(action as any).ACTOR_REF] = getDropTargetCard(
      state,
      !!primaryCard ? { x: primaryCard.x, y: primaryCard.y } : { x: 0, y: 0 }
    );
  }

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
      if (
        distance < CARD_ATTACH_TARGET_MAX_DISTANCE &&
        distance > CARD_ATTACH_TARGET_MIN_DISTANCE &&
        card.x < (primaryCard?.x ?? 0) &&
        card.y > (primaryCard?.y ?? 0)
      ) {
        possibleAttachTargets.push({
          distance,
          card,
        });
      }
    });
  }

  state.attachTargetCards[(action as any).ACTOR_REF] =
    possibleAttachTargets.sort((c1, c2) => c1.distance - c2.distance)[0]
      ?.card ?? null;

  const dropTarget = state.dropTargetCards[(action as any).ACTOR_REF];
  const attachTarget = state.attachTargetCards[(action as any).ACTOR_REF];
  if (!!attachTarget) {
    // First, figure out where we should draw the ghost card. Keep moving up
    // and to the right until there's not a card there

    const drawPos = getAttachDrawPos(state, attachTarget);

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
      state.ghostCards.push(attachGhostCard);
    }
  } else {
    // remove all 'attachment' ghost cards
    state.ghostCards = state.ghostCards.filter(
      (gc) => gc.cardStack.length > 0 && gc.cardStack[0].jsonId !== "-1"
    );
  }

  // Create the 'snap guideline' cards if we don't have a drop target or attach target
  state.ghostCards = transformGhostCardsWhenSnapping(
    state,
    action.payload.snap,
    (action as any).ACTOR_REF,
    !!dropTarget,
    !!attachTarget
  );

  // put the moved cards at the end. TODO: we could just store the move order or move time
  // or something, and the array could be a selector
  movedCards.forEach((movedCard) => {
    state.cards.push(state.cards.splice(state.cards.indexOf(movedCard), 1)[0]);
  });
};

const endCardMoveWithSnapReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; snap: boolean }>
> = (state, action) => {
  let dropTargetCards: ICardDetails[] = [];
  let attachTargetCardStacks: ICardStack[] = [];

  const cardsThatWereDragging = state.cards.filter(
    (card) => card.dragging && card.controlledBy === (action as any).ACTOR_REF
  );

  cardsThatWereDragging.forEach((card) => {
    card.dragging = false;

    // GRID SNAPPING
    if (action.payload.snap && !card.attachedTo) {
      card.x =
        Math.round(card.x / cardConstants.GRID_SNAP_WIDTH) *
        cardConstants.GRID_SNAP_WIDTH;
      card.y =
        Math.round(card.y / cardConstants.GRID_SNAP_HEIGHT) *
        cardConstants.GRID_SNAP_HEIGHT;
    }
    if (!!state.attachTargetCards[(action as any).ACTOR_REF]) {
      attachTargetCardStacks.push(card);
    } else if (!!state.dropTargetCards[(action as any).ACTOR_REF]) {
      // Add the cards to the drop Target card stack
      dropTargetCards = dropTargetCards.concat(card.cardStack);
    }
  });

  const attachTarget = state.attachTargetCards[(action as any).ACTOR_REF];
  const attachTargetCardFromState = state.cards.find(
    (c) => c.id === attachTarget?.id
  );

  if (!!attachTarget && !!attachTargetCardFromState) {
    const drawPos = getAttachDrawPos(state, attachTarget);
    attachTargetCardStacks.forEach((cs, index) => {
      cs.x = drawPos.x + index * cardConstants.ATTACHMENT_OFFSET;
      cs.y = drawPos.y - index * cardConstants.ATTACHMENT_OFFSET;

      removeAttachedCard(state, cs);

      cs.attachedTo = attachTarget.id;
      attachTargetCardFromState.attachedCardIds = addAttachedCard(
        attachTargetCardFromState,
        cs
      );
      console.log(
        `attached ${cs.cardStack[0].jsonId} to ${attachTargetCardFromState.cardStack[0].jsonId}`
      );
      console.log(JSON.stringify(attachTargetCardFromState.attachedCardIds));
      state.cards.unshift(state.cards.splice(state.cards.indexOf(cs), 1)[0]);
    });
    // Now, if there was a drop target card, remove all those cards from the state
  } else if (!!state.dropTargetCards[(action as any).ACTOR_REF]) {
    state.cards = state.cards.filter(
      (card) =>
        !(
          card.id === action.payload.id ||
          (card.selected && card.controlledBy === (action as any).ACTOR_REF)
        )
    );

    const dropTargetCard = state.cards.find(
      (card) => card.id === state.dropTargetCards[(action as any).ACTOR_REF]?.id
    );
    if (!!dropTargetCard && dropTargetCards.length > 0) {
      // add the cards we've collected to the top of the stack
      dropTargetCard.cardStack = dropTargetCards.concat(
        dropTargetCard.cardStack
      );
    }
  }

  // Now move any attached cards
  cardsThatWereDragging.forEach((card) => {
    if (!!card.attachedCardIds) {
      card.attachedCardIds.forEach((aCId, index) => {
        const attachedCard = cardsThatWereDragging.find((c) => c.id === aCId);

        if (!attachedCard) {
          console.error(
            `Card ${card.id} said card ${aCId} was attaches, but we couldn't find it in the cards that had been dragging`
          );
          return;
        }

        attachedCard.x = card.x + cardConstants.ATTACHMENT_OFFSET * (index + 1);
        attachedCard.y = card.y - cardConstants.ATTACHMENT_OFFSET * (index + 1);
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
};

const toggleTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id?: string; tokenType: StatusTokenType; value?: boolean }>
> = (state, action) => {
  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    if (action.payload.value !== undefined) {
      card.statusTokens[action.payload.tokenType] = action.payload.value;
    } else {
      card.statusTokens[action.payload.tokenType] =
        !card.statusTokens[action.payload.tokenType];
    }
  });
};

const adjustCounterTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id?: string;
    tokenType: CounterTokenType;
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
      c.counterTokens[action.payload.tokenType] = action.payload.value;
    } else if (action.payload.delta !== undefined) {
      c.counterTokens[action.payload.tokenType] += action.payload.delta;
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

const addToPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
  }>
> = (state, action) => {
  const playerIndex = action.payload.playerNumber - 1;
  if (playerIndex < 0 || playerIndex >= state.playerHands.length) {
    console.error(
      `Got an invalid playerNumber: ${action.payload.playerNumber}. PlayerHands length is ${state.playerHands.length}`
    );
    return;
  }

  const playerHand = state.playerHands[playerIndex];

  foreachSelectedAndControlledCard(state, (action as any).ACTOR_REF, (card) => {
    state.playerHands[playerIndex].cards = card.cardStack.concat(
      playerHand.cards
    );
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
    sourceIndex: number;
    destinationIndex: number;
  }>
> = (state, action) => {
  if (state.playerHands.length >= action.payload.playerNumber) {
    const hand = state.playerHands[action.payload.playerNumber - 1];
    const result = Array.from(hand.cards);
    const [removed] = result.splice(action.payload.sourceIndex, 1);
    result.splice(action.payload.destinationIndex, 0, removed);

    hand.cards = result;
  }
};

const removeFromPlayerHandReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    playerNumber: number;
    index: number;
  }>
> = (state, action) => {
  if (state.playerHands.length >= action.payload.playerNumber) {
    const hand = state.playerHands[action.payload.playerNumber - 1];
    const result = Array.from(hand.cards);
    result.splice(action.payload.index, 1);

    hand.cards = result;
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
// Selectors

// slice
const cardsSlice = createSlice({
  name: "cards",
  initialState: initialState,
  reducers: {
    selectCard: selectCardReducer,
    unselectCard: unselectCardReducer,
    toggleSelectCard: toggleSelectCardReducer,
    exhaustCard: exhaustCardReducer,
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
    adjustCounterToken: adjustCounterTokenReducer,
    adjustModifier: adjustModifierReducer,
    clearAllModifiers: clearAllModifiersReducer,
    clearCardTokens: clearCardTokensReducer,
    reorderPlayerHand: reorderPlayerHandReducer,
    removeFromPlayerHand: removeFromPlayerHandReducer,
    addToPlayerHand: addToPlayerHandReducer,
    addToExistingCardStack: addToExistingCardStackReducer,
    addExtraIcon: addExtraIconReducer,
    removeExtraIcon: removeExtraIconReducer,
    toggleExtraIcon: toggleExtraIconReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // TODO: find a way to keep this automatic
      state.cards = action.payload.liveState.present.cards.cards;
      state.ghostCards = action.payload.liveState.present.cards.ghostCards;
    });

    builder.addCase(verifyRemoteGameState, (state, action) => {
      state.outOfSyncWithRemote = !(
        isEqual(
          original(state.cards)?.filter((c) => !c.dragging),
          action.payload.liveState.present.cards.cards.filter(
            (c) => !c.dragging
          )
        ) &&
        isEqual(
          original(state.ghostCards),
          action.payload.liveState.present.cards.ghostCards
        )
      );

      if (state.outOfSyncWithRemote) {
        console.error(
          "CARDS state is out of synce with remote!!!",
          original(state),
          action.payload.liveState.present.cards
        );
      } else {
        console.log("CARDS state is in sync");
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
      state.playerHands = generateDefaultPlayerHands();
      // state.previewCard = null;
      state.dropTargetCards = {};
      state.ghostCards = [];
      state.panMode = true;
    });

    builder.addCase(addCardStackWithSnapAndId, (state, action) => {
      const x = action.payload.snap
        ? Math.round(
            action.payload.position.x / cardConstants.GRID_SNAP_WIDTH
          ) * cardConstants.GRID_SNAP_WIDTH
        : action.payload.position.x;
      const y = action.payload.snap
        ? Math.round(
            action.payload.position.y / cardConstants.GRID_SNAP_HEIGHT
          ) * cardConstants.GRID_SNAP_HEIGHT
        : action.payload.position.y;

      const newStack: ICardStack = {
        controlledBy: "",
        x,
        y,
        dragging: false,
        shuffling: false,
        exhausted: false,
        faceup: true,
        fill: "red",
        id: action.payload.id,
        cardStack: action.payload.cardJsonIds.map((jsonId) => ({
          jsonId,
        })),
        selected: false,
        statusTokens: {
          stunned: false,
          confused: false,
          tough: false,
        },
        counterTokens: {
          damage: 0,
          threat: 0,
          generic: 0,
        },
        modifiers: {},
        extraIcons: [],
      };

      state.cards.push(newStack);
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
        newCard.x = newCard.x + cardConstants.GRID_SNAP_WIDTH;

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
            card.dragging = true;

            // if the card has other attached cards, select them and drag them
            if (!!card.attachedCardIds && card.attachedCardIds.length > 0) {
              state.cards
                .filter((c) => card.attachedCardIds?.some((aC) => aC === c.id))
                .forEach((card) => {
                  card.dragging = true;
                  card.selected = true;
                  card.controlledBy = myPeerRef;
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
              console.log(
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
              jsonId: topCardDetails.jsonId,
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
            newCard.x = newCard.x + cardConstants.GRID_SNAP_WIDTH * (index + 1);
            newCard.y += cardConstants.CARD_HEIGHT;

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
  console.log("got decklist");
  console.log(action);

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
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
    extraIcons: [],
  };

  let mainDeckStack: ICardDetails[] = [];
  Object.entries(action.payload.data.slots).forEach(([key, value]) => {
    const cardDetails: ICardDetails[] = Array.from(Array(value).keys()).map(
      (): ICardDetails => ({ jsonId: key })
    );
    mainDeckStack = mainDeckStack.concat(cardDetails);
  });

  const cardPadding = cardConstants.CARD_WIDTH + 10;

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
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
    extraIcons: [],
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
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
    extraIcons: [],
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
      stunned: false,
      confused: false,
      tough: false,
    },
    counterTokens: {
      damage: 0,
      threat: 0,
      generic: 0,
    },
    modifiers: {},
    extraIcons: [],
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
  adjustCounterToken,
  clearCardTokens,
  adjustModifier,
  clearAllModifiers,
  reorderPlayerHand,
  removeFromPlayerHand,
  addToPlayerHand,
  addToExistingCardStack,
  addExtraIcon,
  removeExtraIcon,
  toggleExtraIcon,
} = cardsSlice.actions;

export default cardsSlice.reducer;
