import { COLORS } from "../../constants/app-constants";
import { CardAttachLocation } from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/U6scsOGrPtVym4nCLaYjyw__imagepage/img/xWmS-tyaMfbsHI4pt88gFpHPlbA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7387735.png",
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
    roles: [{ name: "Empire" }, { name: "Rebel" }, { name: "Solo" }],
  },
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
  textCounters: [
    {
      counterName: "Resources",
      counterText: "Resources",
      counterColor: COLORS.YELLOW,
    },
  ],
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
