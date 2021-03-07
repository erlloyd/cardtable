import { Vector2d } from "konva/types/types";
import { CardData } from "../external-api/common-card-data";

export const convertMarvelTxtToDeckInfo = (
  heroDataByName: { [key: string]: CardData },
  playerCardDataByName: { [key: string]: CardData },
  position: Vector2d,
  txtContents: string
) => {
  const nonEmptyLines = txtContents
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !!l);

  let heroName = "";
  const packLineIndex = nonEmptyLines.findIndex((l) =>
    l.toLocaleLowerCase().startsWith("pack")
  );
  if (packLineIndex !== -1) {
    heroName = nonEmptyLines[packLineIndex - 1];
  }

  const hero = heroDataByName[heroName];
  if (!hero) {
    throw new Error(`Could not find hero with name ${heroName}`);
  }

  // Mock out the slots
  const pattern = /^\dx/;
  const slotLines = nonEmptyLines.filter((l) => l.match(pattern)?.index === 0);
  let slots: { [key: string]: number } = {};

  slotLines.forEach((sl) => {
    // first character should be a number
    const quantity = parseInt(sl[0]);
    if (Number.isNaN(quantity)) {
      throw new Error("Could not get number from txt file for card");
    }

    const cardName = sl.split(pattern)[1].split("(")[0].trim();
    const card = playerCardDataByName[cardName];
    slots[card.code] = quantity;
  });

  console.log(heroName);
  return {
    data: {
      investigator_code: hero.code,
      slots,
    },
  };
};
