import { scrapeApi } from "../../constants/api-constants";
import {
  CardAttachLocation,
  CounterTokenType,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/FCz9Iu2kG-5-XLtWAeymwQ__imagepage/img/Y_9WX_TRX7QJXlOdGlE_HAp6CvY=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6293682.jpg",
  deckSite: "rangersdb.com",
  // decklistApi: "https://gapi.rangersdb.com/v1/graphql",
  decklistApi: scrapeApi + "/rangersproxy",
  decklistSearchApi: "",
  allowSpecificCardSearch: true,
  decklistSearchApiConstants: "",
  encounterUiName: "Sets",
  initialPlaymatImageLocation:
    "/images/from_modules/earthborne-rangers/ebr_global_board_smaller.jpg",
  customPlaymatWidth: 1540,
  additionalPlaymatImageOptions: {
    layout: "ebr",
    additionalImages: [
      {
        displayName: "Player Mat",
        imgUrl:
          "/images/from_modules/earthborne-rangers/ebr_player_board_smaller.jpg",
      },
    ],
  },
  possibleIcons: [
    {
      iconId: "blue_ranger_token",
      iconName: "Blue Ranger Token",
      iconImageUrl:
        "/images/from_modules/earthborne-rangers/blue-ranger-token.png",
    },
    {
      iconId: "purple_ranger_token",
      iconName: "Purple Ranger Token",
      iconImageUrl:
        "/images/from_modules/earthborne-rangers/purple-ranger-token.png",
    },
    {
      iconId: "red_ranger_token",
      iconName: "Red Ranger Token",
      iconImageUrl:
        "/images/from_modules/earthborne-rangers/red-ranger-token.png",
    },
    {
      iconId: "yellow_ranger_token",
      iconName: "Yellow Ranger Token",
      iconImageUrl:
        "/images/from_modules/earthborne-rangers/yellow-ranger-token.png",
    },
  ],
  modifiers: [],
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Prg",
      menuText: "Set Progress",
      imagePath: "/images/from_modules/earthborne-rangers/progress_token.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Harm",
      menuText: "Set Harm",
      imagePath: "/images/from_modules/earthborne-rangers/harm_token.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "Gen",
      menuText: "Set General",
      imagePath: "/images/from_modules/earthborne-rangers/general_token.png",
    },
    acceleration: null,
  },
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.UpAndRight,
  additionalResourcesUris: [
    {
      url: "https://ik.imagekit.io/cardtable/earthborne_rangers/misc/valley_map.jpeg",
      display: "Valley Map",
    },
    {
      url: "https://thelivingvalley.earthbornegames.com/",
      display: "The Living Valley",
    },
    {
      url: "https://thelivingvalley.earthbornegames.com/docs/category/campaign-guide",
      display: "Online Campaign Guide",
    },
    {
      url: "https://rangersdb.com/campaigns",
      display: "Online Campaign Tracker",
    },
  ],
};
