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
    "/images/from_modules/war-of-the-ring-card-game/middle-earth-map.jpg",
  possibleIcons: [],
  modifiers: [],
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Atk",
      menuText: "Set Attack",
      imagePath:
        process.env.PUBLIC_URL +
        "/images/from_modules/war-of-the-ring-card-game/stronghold_attack.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Def",
      menuText: "Set Defense",
      imagePath:
        process.env.PUBLIC_URL +
        "/images/from_modules/war-of-the-ring-card-game/stronghold_defense.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "Path Atk",
      menuText: "Set Path Attack",
      imagePath:
        process.env.PUBLIC_URL +
        "/images/from_modules/war-of-the-ring-card-game/shadow_path_attack.png",
    },
    acceleration: {
      counterTokenType: CounterTokenType.Acceleration,
      isNumeric: true,
      touchMenuLetter: "Path Def",
      menuText: "Set Path Defense",
      imagePath:
        process.env.PUBLIC_URL +
        "/images/from_modules/war-of-the-ring-card-game/path_defense.png",
    },
  },
  iconCounters: [
    {
      counterName: "Corruption",
      counterImage:
        process.env.PUBLIC_URL +
        "/images/from_modules/war-of-the-ring-card-game/corruption.png",
    },
  ],
};
