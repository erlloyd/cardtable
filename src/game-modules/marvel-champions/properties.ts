import {
  StatusTokenType,
  CounterTokenType,
  CardAttachLocation,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/kRvUgYiaOq07kC67ZK5UoQ__itemrep/img/enmioYOA6vc3rEJuWZA27jQtU9c=/fit-in/246x300/filters:strip_icc()/pic4900321.jpg",
  deckSite: "marvelcdb.com",
  decklistApi: "https://marvelcdb.com/api/public/decklist/",
  allowSpecificCardSearch: true,
  privateDecklistApi: "https://marvelcdb.com/api/public/deck/",
  decklistSearchApi: "https://marvelcdb.com/decklists",
  decklistSearchApiConstants: "sort=likes",
  encounterUiName: "Encounter Set",
  initialPlaymatImageLocation: "/images/table/background_marvelchampions.png",
  possibleIcons: [],
  modifiers: [
    {
      attributeId: "thwart",
      attributeName: "Thwart",
      icon: "/images/standard/marvel/thwart.png",
      slot: 1,
    },
    {
      attributeId: "attack",
      attributeName: "Attack",
      icon: "/images/standard/marvel/attack.png",
      slot: 2,
    },
    {
      attributeId: "defense",
      attributeName: "Defense",
      icon: "/images/standard/marvel/defense.png",
      slot: 3,
    },
  ],
  tokens: {
    stunned: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Stunned,
      touchMenuLetter: null,
      menuText: "Stun",
      menuRemoveText: "Remove Stun",
      imagePath: "/images/standard/stunned.png",
    },
    confused: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Confused,
      touchMenuLetter: null,
      menuText: "Confuse",
      menuRemoveText: "Remove Confuse",
      imagePath: "/images/standard/confused.png",
    },
    tough: {
      canStackMultiple: true,
      tokenType: StatusTokenType.Tough,
      touchMenuLetter: null,
      menuText: "Tough",
      menuRemoveText: "Remove Tough",
      imagePath: "/images/standard/tough.png",
    },
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath: "/images/standard/damage.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Thr",
      menuText: "Set Threat",
      imagePath: "/images/standard/threat.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "Gen",
      menuText: "Set Generic Tokens",
      imagePath: "/images/standard/generic_counter.png",
    },
    acceleration: {
      counterTokenType: CounterTokenType.Acceleration,
      isNumeric: true,
      touchMenuLetter: "Accel",
      menuText: "Set Acceleration Tokens",
      imagePath: "/images/standard/acceleration.png",
    },
  },
  defaultAttachLocation: CardAttachLocation.DownAndLeft,
  additionalResourcesUris: [
    { url: "https://marvelcdb.com/", display: "MarvelCDB" },
    { url: "https://hallofheroeslcg.com/", display: "Hall of Heroes" },
    {
      url: "https://images-cdn.fantasyflightgames.com/filer_public/b6/30/b630ddfe-e745-435b-a284-572dd510e15d/mc_rulesreference_v15-compressed.pdf",
      display: "Rules Reference (PDF)",
    },
  ],
};
