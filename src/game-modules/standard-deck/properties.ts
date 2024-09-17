import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://qph.cf2.quoracdn.net/main-qimg-1d9b75afe8648ff0079363ee1e39bd93",
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
  },
  counterTokens: [],
  iconCounters: [],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
