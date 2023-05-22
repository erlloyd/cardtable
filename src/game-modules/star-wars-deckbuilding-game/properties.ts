import { CounterTokenType } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "Scenario",
  backgroundImageLocation:
    process.env.PUBLIC_URL +
    "/images/from_modules/star-wars-deckbuilding-game/death-star-playmat.jpg",
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
      imagePath: process.env.PUBLIC_URL + "/images/standard/damage.png",
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
};
