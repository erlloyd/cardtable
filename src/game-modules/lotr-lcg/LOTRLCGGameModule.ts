import {
  CounterTokenType,
  StatusTokenType,
} from "../../constants/card-constants";
import { GameModule } from "../GameModule";

export default class LOTRLCGGameModule extends GameModule {
  constructor() {
    const properties = {
      deckSite: "ringsdb.com",
      decklistApi: "https://ringsdb.com/api/public/decklist/",
      decklistSearchApi: "https://ringsdb.com/decklists/find",
      decklistSearchApiConstants: "numcores=3&sort=likes",
      encounterUiName: "Scenario",
      backgroundImageLocation:
        process.env.PUBLIC_URL + "/images/table/background_lotrlcg.jpg",
      possibleIcons: [
        {
          iconId: "tactics",
          iconName: "Tactics",
          iconImageUrl:
            process.env.PUBLIC_URL + "/images/standard/lotr/tactics.png",
        },
        {
          iconId: "leadership",
          iconName: "Leadership",
          iconImageUrl:
            process.env.PUBLIC_URL + "/images/standard/lotr/leadership.png",
        },
        {
          iconId: "spirit",
          iconName: "Spirit",
          iconImageUrl:
            process.env.PUBLIC_URL + "/images/standard/lotr/spirit.png",
        },
        {
          iconId: "lore",
          iconName: "Lore",
          iconImageUrl:
            process.env.PUBLIC_URL + "/images/standard/lotr/lore.png",
        },
      ],
      modifiers: [
        {
          attributeId: "threat",
          attributeName: "Threat",
          icon: process.env.PUBLIC_URL + "/images/standard/lotr/threat.png",
          slot: 1,
        },
        {
          attributeId: "willpower",
          attributeName: "Willpower",
          icon: process.env.PUBLIC_URL + "/images/standard/lotr/willpower.png",
          slot: 2,
        },
        {
          attributeId: "attack",
          attributeName: "Attack",
          icon: process.env.PUBLIC_URL + "/images/standard/lotr/attack.png",
          slot: 3,
        },
        {
          attributeId: "defense",
          attributeName: "Defense",
          icon: process.env.PUBLIC_URL + "/images/standard/lotr/defense.png",
          slot: 4,
        },
        {
          attributeId: "hitpoints",
          attributeName: "Hit Points",
          icon: process.env.PUBLIC_URL + "/images/standard/lotr/hitpoints.png",
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
          imagePath: process.env.PUBLIC_URL + "/images/standard/quest.png",
        },
        confused: null,
        tough: null,
        damage: {
          counterTokenType: CounterTokenType.Damage,
          isNumeric: true,
          touchMenuLetter: "Dmg",
          menuText: "Set Damage",
          imagePath:
            process.env.PUBLIC_URL + "/images/standard/damage_lotr.png",
        },
        threat: {
          counterTokenType: CounterTokenType.Threat,
          isNumeric: true,
          touchMenuLetter: "Prg",
          menuText: "Set Progress",
          imagePath: process.env.PUBLIC_URL + "/images/standard/progress.png",
        },
        generic: {
          counterTokenType: CounterTokenType.Generic,
          isNumeric: true,
          touchMenuLetter: "Res",
          menuText: "Set Resource Tokens",
          imagePath: process.env.PUBLIC_URL + "/images/standard/resource.png",
        },
      },
    };
    super(properties, {});
  }
}
