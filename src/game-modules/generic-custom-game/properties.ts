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
  },
  counterTokens: [
    {
      type: "damage",
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath: "/images/standard/damage.png",
    },
    {
      type: "generic",
      touchMenuLetter: "Gen",
      menuText: "Set Generic Tokens",
      imagePath: "/images/standard/generic_counter.png",
    },
  ],
  iconCounters: [],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
