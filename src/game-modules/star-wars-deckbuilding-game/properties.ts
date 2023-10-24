import {
  CardAttachLocation,
  CounterTokenType,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "Scenario",
  initialPlaymatImageLocation:
    "/images/from_modules/star-wars-deckbuilding-game/death-star-playmat.jpg",
  possibleIcons: [],
  modifiers: [],
  roles: {
    requireRole: true,
    roles: [{ name: "Empire" }, { name: "Rebel" }],
  },
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath: "/images/standard/damage.png",
    },
    threat: null,
    generic: null,
    acceleration: null,
  },
  textCounters: [
    {
      counterName: "Resources",
      counterText: "Resources",
      counterColor: "yellow",
    },
  ],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
