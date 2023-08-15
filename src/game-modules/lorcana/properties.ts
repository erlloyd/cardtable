import { CounterTokenType } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  allowSpecificCardSearch: true,
  decklistSearchApiConstants: "",
  encounterUiName: "",
  backgroundImageLocation: "/images/from_modules/lorcana/playermat1.jpg",
  possibleIcons: [],
  modifiers: [],
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
  iconCounters: [],
  useAltCardArtByDefault: true,
};
