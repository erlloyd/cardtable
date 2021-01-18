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
import { resetApp } from "../../store/global.actions";
import {
  addCardStackWithId,
  pullCardOutOfCardStackWithId,
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
  callback: (card: ICardStack) => void
) => {
  const cardToUpdate = getCardStackWithId(state, id);
  if (cardToUpdate) {
    callback(cardToUpdate);
  }
};

const foreachSelectedCard = (
  state: ICardsState,
  callback: (card: ICardStack) => void
) => {
  state.cards.filter((card) => card.selected).forEach((card) => callback(card));
};

const foreachUnselectedCard = (
  state: ICardsState,
  callback: (card: ICardStack) => void
) => {
  state.cards
    .filter((card) => !card.selected)
    .forEach((card) => callback(card));
};

const shuffle = (array: ICardDetails[]) => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

// Reducers
const selectCardReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; unselectOtherCards: boolean }>
> = (state, action) => {
  if (action.payload.unselectOtherCards) {
    unselectAllCardsReducer(state, action);
  }

  mutateCardWithId(state, action.payload.id, (card) => {
    card.selected = true;
  });
};

const unselectCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  mutateCardWithId(state, action.payload, (card) => {
    card.selected = false;
  });
};

const toggleSelectCardReducer: CaseReducer<
  ICardsState,
  PayloadAction<string>
> = (state, action) => {
  mutateCardWithId(state, action.payload, (card) => {
    card.selected = !card.selected;
  });
};

const exhaustCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  state.cards
    .filter((card) => card.id === action.payload || card.selected)
    .forEach((card) => {
      card.exhausted = !card.exhausted;
    });
};

const cardMoveReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ id: string; dx: number; dy: number }>
> = (state, action) => {
  const movedCards: ICardStack[] = [];

  let primaryCard: ICardStack;

  state.cards
    .filter((card) => card.id === action.payload.id || card.selected)
    .forEach((card) => {
      if (card.id === action.payload.id) {
        primaryCard = card;
      }

      card.x += action.payload.dx;
      card.y += action.payload.dy;

      movedCards.push(card);
    });

  // go through and find if any unselected cards are potential drop targets
  // If so, get the closest one
  const possibleDropTargets: { distance: number; card: ICardStack }[] = [];
  foreachUnselectedCard(state, (card) => {
    const distance = getDistance(card, primaryCard);
    if (distance < CARD_DROP_TARGET_DISTANCE) {
      possibleDropTargets.push({
        distance,
        card,
      });
    }
  });

  state.dropTargetCard =
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
    .filter((card) => card.id === action.payload || card.selected)
    .forEach((card) => {
      card.dragging = false;

      if (!!state.dropTargetCard) {
        // Add the cards to the drop Target card stack
        dropTargetCards = dropTargetCards.concat(card.cardStack);
      }
    });

  // Now, if there was a drop target card, remove all those cards from the state
  if (!!state.dropTargetCard) {
    state.cards = state.cards.filter(
      (card) => !(card.id === action.payload || card.selected)
    );

    const dropTargetCard = state.cards.find(
      (card) => card.id === state.dropTargetCard?.id
    );
    if (!!dropTargetCard && dropTargetCards.length > 0) {
      // add the cards we've collected to the top of the stack
      dropTargetCard.cardStack = dropTargetCards.concat(
        dropTargetCard.cardStack
      );
    }
  }

  state.ghostCards = [];
  state.dropTargetCard = null;
};

const selectMultipleCardsReducer: CaseReducer<
  ICardsState,
  PayloadAction<{ ids: string[] }>
> = (state, action) => {
  action.payload.ids
    .map((id) => state.cards.find((card) => card.id === id))
    .forEach((card) => {
      if (card) {
        card.selected = true;
      }
    });
};

const unselectAllCardsReducer: CaseReducer<ICardsState> = (state) => {
  state.cards.forEach((card) => {
    card.selected = false;
  });
};

const hoverCardReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  const cardToPreview = state.cards.find((c) => c.id === action.payload);
  if (!cardToPreview?.faceup) return;

  if (state.previewCard === null) {
    state.previewCard = {
      id: action.payload,
    };
  } else if (action.payload !== state.previewCard.id) {
    state.previewCard.id = action.payload;
  }
};

const hoverLeaveCardReducer: CaseReducer<ICardsState> = (state) => {
  if (state.previewCard !== null) {
    state.previewCard = null;
  }
};

const togglePanModeReducer: CaseReducer<ICardsState> = (state) => {
  state.panMode = !state.panMode;
};

const flipCardsReducer: CaseReducer<ICardsState> = (state, action) => {
  state.cards
    .filter((card) => card.selected)
    .forEach((card) => {
      card.faceup = !card.faceup;
      card.cardStack = card.cardStack.reverse();
    });
};

const shuffleStackReducer: CaseReducer<ICardsState, PayloadAction<string>> = (
  state,
  action
) => {
  shuffle(state.cards.find((c) => c.id === action.payload)?.cardStack || []);
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
  PayloadAction<{ id: string; tokenType: CounterTokenType; delta: number }>
> = (state, action) => {
  const cardToToggle = state.cards.find((c) => c.id === action.payload.id);
  if (!!cardToToggle) {
    cardToToggle.counterTokens[action.payload.tokenType] +=
      action.payload.delta;
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
    hoverCard: hoverCardReducer,
    hoverLeaveCard: hoverLeaveCardReducer,
    togglePanMode: togglePanModeReducer,
    flipCards: flipCardsReducer,
    shuffleStack: shuffleStackReducer,
    resetCards: resetCardsReducer,
    toggleToken: toggleTokenReducer,
    adjustCounterToken: adjustCounterTokenReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(resetApp, (state, action) => {
      state.cards = [];
      state.previewCard = null;
      state.dropTargetCard = null;
      state.ghostCards = [];
      state.panMode = true;
    });

    builder.addCase(addCardStackWithId, (state, action) => {
      const newStack: ICardStack = {
        x: action.payload.position.x,
        y: action.payload.position.y,
        dragging: false,
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
        newCard.x = newCard.x + cardConstants.CARD_WIDTH + 5;

        cardStackToUse.cardStack = cardStackToUse.cardStack.filter(
          (c) => c.jsonId !== action.payload.jsonId
        );
        cardStackToUse.selected = false;

        state.cards.push(newCard);
      }
    });

    builder.addCase(startCardMoveWithSplitStackId, (state, action) => {
      // first, if the card moving isn't currently selected, clear all selected cards
      const cardToStartMoving = getCardStackWithId(state, action.payload.id);
      if (cardToStartMoving && !cardToStartMoving.selected) {
        state.cards = state.cards.map((card) => {
          card.selected = card.id === action.payload.id;
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

        const topCard = cardToMove.cardStack.shift();
        const newCard = Object.assign({}, cardToMove, {
          selected: true,
          dragging: true,
          cardStack: [topCard],
        });

        cardToMove.id = action.payload.splitCardId;

        state.cards.push(newCard);
      }

      // Now all selected cards should be put into ghost cards, unless we are splitting the top card
      state.ghostCards = [];

      if (!action.payload.splitTopCard) {
        foreachSelectedCard(state, (card) => {
          card.dragging = true;
          state.ghostCards.push(Object.assign({}, card));
        });
      }
    });

    builder.addCase(fetchDecklistById.fulfilled, (state, action) => {
      console.log("got decklist");
      console.log(action);

      const heroCard: ICardStack = {
        x: action.payload.position.x,
        y: action.payload.position.y,
        dragging: false,
        exhausted: false,
        faceup: true,
        fill: "red",
        id: action.payload.heroId,
        cardStack: [{ jsonId: action.payload.data.investigator_code }],
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

      let mainDeckStack: ICardDetails[] = [];
      Object.entries(action.payload.data.slots).forEach(([key, value]) => {
        const cardDetails: ICardDetails[] = Array.from(Array(value).keys()).map(
          (): ICardDetails => ({ jsonId: key })
        );
        mainDeckStack = mainDeckStack.concat(cardDetails);
      });

      const cardPadding = cardConstants.CARD_WIDTH + 10;

      const newDeck: ICardStack = {
        x: action.payload.position.x + cardPadding,
        y: action.payload.position.y,
        dragging: false,
        exhausted: false,
        faceup: true,
        fill: "red",
        id: action.payload.dataId,
        cardStack: mainDeckStack,
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

      const encounterDeck: ICardStack = {
        x: action.payload.position.x + cardPadding * 2,
        y: action.payload.position.y,
        dragging: false,
        exhausted: false,
        faceup: true,
        fill: "red",
        id: action.payload.encounterDeckId,
        cardStack: action.payload.relatedEncounterDeck.map((jsonId) => ({
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

      const obligationDeck: ICardStack = {
        x: action.payload.position.x + cardPadding * 3,
        y: action.payload.position.y,
        dragging: false,
        exhausted: false,
        faceup: true,
        fill: "red",
        id: action.payload.obligationDeckId,
        cardStack: action.payload.relatedObligationDeck.map((jsonId) => ({
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
  hoverCard,
  hoverLeaveCard,
  togglePanMode,
  flipCards,
  shuffleStack,
  resetCards,
  toggleToken,
  adjustCounterToken,
} = cardsSlice.actions;

export default cardsSlice.reducer;
