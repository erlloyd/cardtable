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
  encounterUiName: "Cards",
  initialPlaymatImageLocation:
    "/images/from_modules/marvel-legendary/spiderman-legendary.png",
  customPlaymatWidth: 1440,
  possibleIcons: [],
  modifiers: [],
  tokens: {
    stunned: null,
    confused: null,
    tough: null,
    damage: null,
    threat: null,
    generic: null,
    acceleration: null,
  },
  iconCounters: [],
  useAltCardArtByDefault: true,
  defaultAttachLocation: CardAttachLocation.UpAndRight,
};
