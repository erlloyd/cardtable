import {
  StatusTokenType,
  CounterTokenType,
  CardAttachLocation,
} from "../../constants/card-constants";
import { GameProperties } from "../GameModule";

export const properties: GameProperties = {
  heroImageUrl:
    "https://cf.geekdo-images.com/ZmXi5BbtoWl58ZnKcUy1vw__itemrep/img/pbBXQjhJ3fJVgcsI4mdT0qdHULI=/fit-in/246x300/filters:strip_icc()/pic906495.jpg",
  deckSite: "ringsdb.com",
  decklistApi: "https://ringsdb.com/api/public/decklist/",
  allowSpecificCardSearch: true,
  decklistSearchApi: "https://ringsdb.com/decklists/find",
  decklistSearchApiConstants: "numcores=3&sort=likes",
  encounterUiName: "Scenario",
  initialPlaymatImageLocation: "/images/table/background_lotrlcg.jpg",
  possibleIcons: [
    {
      iconId: "tactics",
      iconName: "Tactics",
      iconImageUrl: "/images/standard/lotr/tactics.png",
    },
    {
      iconId: "leadership",
      iconName: "Leadership",
      iconImageUrl: "/images/standard/lotr/leadership.png",
    },
    {
      iconId: "spirit",
      iconName: "Spirit",
      iconImageUrl: "/images/standard/lotr/spirit.png",
    },
    {
      iconId: "lore",
      iconName: "Lore",
      iconImageUrl: "/images/standard/lotr/lore.png",
    },
  ],
  modifiers: [
    {
      attributeId: "threat",
      attributeName: "Threat",
      icon: "/images/standard/lotr/threat.png",
      slot: 1,
    },
    {
      attributeId: "willpower",
      attributeName: "Willpower",
      icon: "/images/standard/lotr/willpower.png",
      slot: 2,
    },
    {
      attributeId: "attack",
      attributeName: "Attack",
      icon: "/images/standard/lotr/attack.png",
      slot: 3,
    },
    {
      attributeId: "defense",
      attributeName: "Defense",
      icon: "/images/standard/lotr/defense.png",
      slot: 4,
    },
    {
      attributeId: "hitpoints",
      attributeName: "Hit Points",
      icon: "/images/standard/lotr/hitpoints.png",
      slot: 5,
    },
  ],
  tokens: {
    stunned: {
      canStackMultiple: false,
      tokenType: StatusTokenType.Stunned,
      touchMenuLetter: "Q",
      menuText: "Quest",
      menuRemoveText: "Remove From Quest",
      imagePath: "/images/standard/quest.png",
    },
    confused: null,
    tough: null,
    damage: {
      counterTokenType: CounterTokenType.Damage,
      isNumeric: true,
      touchMenuLetter: "Dmg",
      menuText: "Set Damage",
      imagePath: "/images/standard/damage_lotr.png",
    },
    threat: {
      counterTokenType: CounterTokenType.Threat,
      isNumeric: true,
      touchMenuLetter: "Prg",
      menuText: "Set Progress",
      imagePath: "/images/standard/progress.png",
    },
    generic: {
      counterTokenType: CounterTokenType.Generic,
      isNumeric: true,
      touchMenuLetter: "Res",
      menuText: "Set Resource Tokens",
      imagePath: "/images/standard/resource.png",
    },
    acceleration: null,
  },
  defaultAttachLocation: CardAttachLocation.UpAndRight,
  additionalResourcesUris: [
    { url: "https://ringsdb.com/", display: "RingsDB" },
    { url: "https://hallofbeorn.com/LotR", display: "Hall of Beorn" },
    {
      url: "https://s3.amazonaws.com/geekdo-files.com/bgg75522?response-content-disposition=inline%3B%20filename%3D%22LoTR_LCG_QuickRef_v10.pdf%22&response-content-type=application%2Fpdf&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJYFNCT7FKCE4O6TA%2F20240131%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240131T212804Z&X-Amz-SignedHeaders=host&X-Amz-Expires=120&X-Amz-Signature=48b0f643f72974ee6ee1ca22462b7194c0a4d4982290eed854ee71ceceb5c3f7",
      display: "Turn Order Ref (PDF)",
    },
    {
      url: "https://images-cdn.fantasyflightgames.com/filer_public/e9/2f/e92f2465-8a1e-4bfa-8293-ad0edd5e55c0/mec101_learn_to_play_eng_v11-compressed.pdf",
      display: "Learn to Play (PDF)",
    },
    {
      url: "https://images-cdn.fantasyflightgames.com/filer_public/f2/87/f28704b2-5f25-4fd8-be7a-18d4a5d2c1c4/mec101_core_set_rules_reference_v10c-compressed.pdf",
      display: "Rules Reference (PDF)",
    },
  ],
};
