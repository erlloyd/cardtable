import { GamePropertiesMap } from "../constants/game-type-properties-mapping";
import { GameType } from "../game-modules/GameModule";
import { cacheImages } from "./card-utils";

export const cacheCommonImages = (gameType: GameType) => {
  const mapping = GamePropertiesMap[gameType];

  // we don't need to cache background image because by loading a new
  // game type we will cache that automatically. Same with the first player token
  const imgs = ([] as string[])
    .concat(mapping.possibleIcons.map((i) => i.iconImageUrl))
    .concat(mapping.modifiers.map((m) => m.icon))
    .concat(
      Object.values(mapping.tokens)
        .map((t) => t?.imagePath)
        .filter((i) => !!i) as string[]
    );

  cacheImages(imgs);
};
