import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "Deck",
  initialPlaymatImageLocation: "",
  possibleIcons: [],
  modifiers: [],
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
    damage: null,
    threat: null,
    generic: null,
    acceleration: null,
  },
  iconCounters: [],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
