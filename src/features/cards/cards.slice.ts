import { createSlice, PayloadAction, CaseReducer } from "@reduxjs/toolkit";
import { getDistance } from "../../utilities/geo";
import {
  initialState,
  ICardsState,
  ICardStack,
  ICardDetails,
} from "./initialState";
import { fetchDecklistById } from "./cards.thunks";
import { cardConstants } from "../../constants/card-constants";
import { receiveRemoteGameState, resetApp } from "../../store/global.actions";
import {
  addCardStackWithId,
  drawCardsOutOfCardStackWithIds,
  pullCardOutOfCardStackWithId,
  replaceCardStack,
  setStackShuffling,
  startCardMoveWithSplitStackId,
} from "./cards.actions";

const CARD_DROP_TARGET_DISTANCE = 30;

export enum StatusTokenType {
  Stunned = "stunned",
  Confused = "confused",
  Tough = "tough",
}

export enum CounterTokenType {
  Damage = "damage",
  Threat = "threat",
  Generic = "generic",
}

// Helper methods
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

const cardMoveReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; dx: number; dy: number }>
> = (state, action) => {
  const movedCards: ICardStack[] = [];

  let primaryCard: ICardStack | null = null;

  state.cards
    .filter(
      (card) =>
        card.id === action.payload.id ||
        (card.selected && card.controlledBy === (action as any).ACTOR_REF)
    )
    .forEach((card) => {
      if (card.id === action.payload.id) {
        primaryCard = card;
      }

      card.x += action.payload.dx;
      card.y += action.payload.dy;

      movedCards.push(card);
    });

  // go through and find if any unselected cards are potential drop targets
  // If so, get the closest one. But only if the card is owned / controlled by us
  const possibleDropTargets: { distance: number; card: ICardStack }[] = [];
  if (
    !!primaryCard &&
    (primaryCard as ICardStack).controlledBy === (action as any).ACTOR_REF
  ) {
    foreachUnselectedCard(state, (card) => {
      const distance = getDistance(
        { x: card.x, y: card.y },
        !!primaryCard ? { x: primaryCard.x, y: primaryCard.y } : { x: 0, y: 0 }
      );
      if (distance < CARD_DROP_TARGET_DISTANCE) {
        possibleDropTargets.push({
          distance,
          card,
        });
      }
    });
  }

  state.dropTargetCards[(action as any).ACTOR_REF] =
    possibleDropTargets.sort((c1, c2) => c1.distance - c2.distance)[0]?.card ??
    null;

  // put the moved cards at the end. TODO: we could just store the move order or move time
  // or something, and the array could be a selector
  movedCards.forEach((movedCard) => {
    state.cards.push(state.cards.splice(state.cards.indexOf(movedCard), 1)[0]);
  });
};

const endCardMoveReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  let dropTargetCards: ICardDetails[] = [];
  state.cards
    .filter(
      (card) =>
        card.id === action.payload ||
        (card.selected && card.controlledBy === (action as any).ACTOR_REF)
    )
    .forEach((card) => {
      card.dragging = false;

      if (!!state.dropTargetCards[(action as any).ACTOR_REF]) {
        // Add the cards to the drop Target card stack
        dropTargetCards = dropTargetCards.concat(card.cardStack);
      }
    });

  // Now, if there was a drop target card, remove all those cards from the state
  if (!!state.dropTargetCards[(action as any).ACTOR_REF]) {
    state.cards = state.cards.filter(
      (card) =>
        !(
          card.id === action.payload ||
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

  state.ghostCards = [];
  state.dropTargetCards[(action as any).ACTOR_REF] = null;
};

const selectMultipleCardsReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ ids: string[] }>
> = (state, action) => {
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
};

const toggleTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; tokenType: StatusTokenType; value: boolean }>
> = (state, action) => {
  const cardToToggle = state.cards.find((c) => c.id === action.payload.id);
  if (!!cardToToggle) {
    cardToToggle.statusTokens[action.payload.tokenType] = action.payload.value;
  }
};

const adjustCounterTokenReducer: CaseReducer<
  ICardsState,
  PayloadAction<{
    id: string;
    tokenType: CounterTokenType;
    delta?: number;
    value?: number;
  }>
> = (state, action) => {
  const cardToToggle = state.cards.find((c) => c.id === action.payload.id);
  if (!!cardToToggle) {
    if (action.payload.value !== undefined) {
      cardToToggle.counterTokens[action.payload.tokenType] =
        action.payload.value;
    } else if (action.payload.delta !== undefined) {
      cardToToggle.counterTokens[action.payload.tokenType] +=
        action.payload.delta;
    }
    if (cardToToggle.counterTokens[action.payload.tokenType] < 0) {
      cardToToggle.counterTokens[action.payload.tokenType] = 0;
    }
  }
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
    cardMove: cardMoveReducer,
    endCardMove: endCardMoveReducer,
    selectMultipleCards: selectMultipleCardsReducer,
    unselectAllCards: unselectAllCardsReducer,
    togglePanMode: togglePanModeReducer,
    flipCards: flipCardsReducer,
    resetCards: resetCardsReducer,
    toggleToken: toggleTokenReducer,
    adjustCounterToken: adjustCounterTokenReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(receiveRemoteGameState, (state, action) => {
      // TODO: find a way to keep this automatic
      state.cards = action.payload.liveState.present.cards.cards;
      state.ghostCards = action.payload.liveState.present.cards.ghostCards;
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
      // state.previewCard = null;
      state.dropTargetCards = {};
      state.ghostCards = [];
      state.panMode = true;
    });

    builder.addCase(addCardStackWithId, (state, action) => {
      const newStack: ICardStack = {
        controlledBy: "",
        x: action.payload.position.x,
        y: action.payload.position.y,
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
        newCard.x = newCard.x + cardConstants.CARD_WIDTH + 5;

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
            state.ghostCards.push(Object.assign({}, card));
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
      unselectAllCardsReducer(state, (action as unknown) as any);

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
      for (let index = 0; index < action.payload.numberToDraw; index++) {
        if (!!cardStackToUse) {
          const topCardDetails = cardStackToUse.cardStack.shift();
          if (!topCardDetails) {
            throw new Error("Expected to find a top card, but didn't");
          }
          const newCardStack: ICardDetails[] = [
            { jsonId: topCardDetails.jsonId },
          ];
          const newCard = Object.assign({}, cardStackToUse, {
            cardStack: newCardStack,
          });
          newCard.id = action.payload.idsToUse[index];
          newCard.selected = true;
          newCard.controlledBy = (action as any).ACTOR_REF;
          newCard.faceup = true;
          newCard.x = newCard.x + (cardConstants.CARD_WIDTH + 5) * (index + 1);
          newCard.y += cardConstants.CARD_HEIGHT;

          if (cardStackToUse.cardStack.length === 0) {
            // we went through all the cards, remove the original card
            state.cards = state.cards.filter((c) => c.id !== sourceCardStackId);
            cardStackToUse = undefined;
          }

          state.cards.push(newCard);
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

    builder.addCase(fetchDecklistById.fulfilled, (state, action) => {
      console.log("got decklist");
      console.log(action);

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
        cardStack: [
          { jsonId: action.payload.data.investigator_code },
          ...action.payload.extraHeroCards,
        ],
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
      };

      state.cards.push(heroCard, newDeck, encounterDeck, obligationDeck);
    });
  },
});

export const {
  selectCard,
  unselectCard,
  toggleSelectCard,
  exhaustCard,
  cardMove,
  endCardMove,
  selectMultipleCards,
  unselectAllCards,
  togglePanMode,
  flipCards,
  resetCards,
  toggleToken,
  adjustCounterToken,
} = cardsSlice.actions;

export default cardsSlice.reducer;
