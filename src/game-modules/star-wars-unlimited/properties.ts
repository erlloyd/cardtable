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
      imagePath: "/images/standard/damage.png",
    },
    threat: null,
    generic: null,
    acceleration: null,
  },
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.Below,
};
