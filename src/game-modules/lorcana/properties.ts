import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/yATIBXRz67ltSBxHwZLosg__imagepage/img/uwuYlVesC1--Q3t15yWqA8pEkDM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7036897.png",
  deckSite: "",
  decklistApi: "",
  decklistSearchApi: "",
  allowSpecificCardSearch: true,
  decklistSearchApiConstants: "",
  encounterUiName: "Quest",
  initialPlaymatImageLocation: "/images/from_modules/lorcana/playermat1.jpg",
  additionalPlaymatImageOptions: {
    layout: "row",
    additionalImages: [
      {
        displayName: "Columns #1",
        imgUrl: "/images/from_modules/lorcana/playermat1.jpg",
      },
      {
        displayName: "Columns #2",
        imgUrl: "/images/from_modules/lorcana/playermat2.jpg",
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
      imagePath: "/images/standard/damage.png",
    },
  ],
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
