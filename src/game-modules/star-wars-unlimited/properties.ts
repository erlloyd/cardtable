import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/YRZ0kNHp-NnWQf9yw7ldGw__imagepage/img/5vDANq7_thiJpAOmH4e1SXetCOo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7503747.jpg",
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
  },
  counterTokens: [
    {
      type: "damage",
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_damage_token.png",
    },
    {
      type: "shield",
      touchMenuLetter: "Shld",
      menuText: "Set Shields",
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_shield_token.png",
    },
    {
      type: "xp",
      touchMenuLetter: "XP",
      menuText: "Set XP",
      imagePath: "/images/from_modules/star-wars-unlimited/swu_xp_token.png",
    },
    {
      type: "important",
      singleOnly: true,
      touchMenuLetter: "Impt",
      menuText: "Set Important",
      imagePath:
        "/images/from_modules/star-wars-unlimited/swu_important_token.png",
    },
  ],
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.Below,
};
