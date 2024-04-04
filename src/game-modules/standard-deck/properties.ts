import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://images.ctfassets.net/sm166qdr1jca/2B0MXRrvv3ToeRH38QbhKg/5d52594452841f338feba538e8ab5c1f/Website_Red_Riderback.jpg",
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
