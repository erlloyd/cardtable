import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl: "",
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "",
  initialPlaymatImageLocation: "/images/standard/custom-background.png",
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
