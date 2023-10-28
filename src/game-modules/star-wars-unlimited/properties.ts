import {
  CardAttachLocation,
  CounterTokenType,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  allowSpecificCardSearch: true,
  decklistSearchApiConstants: "",
  encounterUiName: "",
  initialPlaymatImageLocation:
    "/images/from_modules/star-wars-unlimited/playmat-default.jpg",
  additionalPlaymatImageOptions: {
    layout: "row",
    additionalImages: [
      {
        displayName: "Darth Vader",
        imgUrl: "/images/from_modules/star-wars-unlimited/playmat-darth.jpg",
      },
      {
        displayName: "Luke Skywalker",
        imgUrl: "/images/from_modules/star-wars-unlimited/playmat-luke.jpg",
      },
    ],
  },
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
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_damage_token.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Shld",
      menuText: "Set Shields",
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_shield_token.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "XP",
      menuText: "Set XP",
      imagePath: "/images/from_modules/star-wars-unlimited/swu_xp_token.png",
    },
    acceleration: {
      counterTokenType: CounterTokenType.Acceleration,
      isNumeric: true,
      singleOnly: true,
      touchMenuLetter: "Impt",
      menuText: "Set Important",
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_important_token.png",
    },
  },
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.Below,
};
