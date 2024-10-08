import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/ScrF673pQhrx27WoVdG81g__itemrep/img/XYtTCjHdbyf7uLSK1fc1SH1V1TI=/fit-in/246x300/filters:strip_icc()/pic6982333.png",
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  decklistSearchApiConstants: "",
  encounterUiName: "Scenario",
  initialPlaymatImageLocation:
    "/images/from_modules/war-of-the-ring-card-game/middle-earth-map.jpg",
  possibleIcons: [],
  modifiers: [],
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
  },
  counterTokens: [
    {
      type: "attack",
      touchMenuLetter: "Atk",
      menuText: "Set Attack",
      imagePath:
        "/images/from_modules/war-of-the-ring-card-game/stronghold_attack.png",
    },
    {
      type: "defense",
      touchMenuLetter: "Def",
      menuText: "Set Defense",
      imagePath:
        "/images/from_modules/war-of-the-ring-card-game/stronghold_defense.png",
    },
    {
      type: "path_attack",
      touchMenuLetter: "Path Atk",
      menuText: "Set Path Attack",
      imagePath:
        "/images/from_modules/war-of-the-ring-card-game/shadow_path_attack.png",
    },
    {
      type: "path_def",
      touchMenuLetter: "Path Def",
      menuText: "Set Path Defense",
      imagePath:
        "/images/from_modules/war-of-the-ring-card-game/path_defense.png",
    },
  ],
  iconCounters: [
    {
      counterName: "Corruption",
      counterImage:
        "/images/from_modules/war-of-the-ring-card-game/corruption.png",
    },
  ],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
