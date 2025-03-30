import React, { useEffect, useRef, useState } from "react";
import { Rect, Group, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { ICardStack } from "./features/cards/initialState";
import { GameType } from "./game-modules/GameType";
import useImage from "use-image";

interface IProps {
  currentGameType: GameType;
  x: number;
  y: number;
  card: ICardStack | undefined;
  cardHeight: number | undefined;
  cardWidth: number | undefined;
  isPreview: boolean;
}

const desiredWidth = 36;
const desiredHeight = 36;

const textWidth = 40;

const CardModifiersFunctional: React.FC<IProps> = ({
  currentGameType,
  x,
  y,
  card,
  cardHeight,
  cardWidth,
  isPreview,
}) => {
  const modifierImagesWithStatus: {
    img: HTMLImageElement | undefined;
    status: "loaded" | "loading" | "failed";
  }[] = [];

  const additionalIconImagesWithStatus: {
    img: HTMLImageElement | undefined;
    status: "loaded" | "loading" | "failed";
  }[] = [];

  const modifiersInfo = GamePropertiesMap[currentGameType].modifiers;
  const additionalIcons = GamePropertiesMap[currentGameType].possibleIcons;

  //load all the images
  modifiersInfo.forEach((mi) => {
    let [img, status] = useImage(mi.icon);
    modifierImagesWithStatus.push({ img, status });
  });

  additionalIcons.forEach((ai) => {
    let [img, status] = useImage(ai.iconImageUrl);
    additionalIconImagesWithStatus.push({ img, status });
  });

  if (!card || !card.modifiers) return null;

  const nodesToRender: JSX.Element[] = [];

  modifiersInfo.forEach((m, i) => {
    const modifierX = isPreview
      ? x + (cardWidth || 0) / 2 - desiredWidth - textWidth
      : x + cardConstants[card.sizeType].CARD_WIDTH / 2 - desiredWidth / 2;
    const modifierTextX = modifierX + desiredWidth - 2;
    const modifierY =
      y -
      cardConstants[card.sizeType].CARD_HEIGHT / 2 +
      10 * (m.slot - 1) +
      desiredHeight * (m.slot - 1);

    const img = modifierImagesWithStatus[i].img;

    const showModifier =
      !!img &&
      modifierImagesWithStatus[i].status === "loaded" &&
      !!card.modifiers[m.attributeId];

    const modifierValue = card.modifiers[m.attributeId];

    const modifierToken = showModifier ? (
      <Rect
        key={`${card.id}-${m.attributeId}-modifier-token`}
        x={modifierX}
        y={modifierY}
        scale={{
          x: desiredWidth / img.naturalWidth,
          y: desiredHeight / img.naturalHeight,
        }}
        width={img.naturalWidth}
        height={img.naturalHeight}
        fillPatternImage={img}
      ></Rect>
    ) : null;

    const modifierText = showModifier ? (
      <Group
        key={`${card.id}-${m.attributeId}-modifier-text`}
        x={modifierTextX}
        y={modifierY}
        width={textWidth}
        height={desiredHeight}
      >
        <Rect width={textWidth} height={desiredHeight} fill="white"></Rect>
        <Text
          width={textWidth}
          height={desiredHeight}
          text={`${modifierValue && modifierValue > 0 ? "+" : ""}${
            modifierValue ?? "?"
          }`}
          fill="black"
          background="white"
          align="center"
          verticalAlign="middle"
          fontSize={24}
        ></Text>
      </Group>
    ) : null;

    if (!!modifierToken) {
      nodesToRender.push(modifierToken);
    }
    if (!!modifierText) {
      nodesToRender.push(modifierText);
    }
  });

  additionalIcons.forEach((a, index) => {
    const iconX = isPreview
      ? x - (cardWidth || 0) / 2 + desiredWidth
      : x - cardConstants[card.sizeType].CARD_WIDTH / 2 - desiredWidth / 2;

    const iconY =
      y -
      cardConstants[card.sizeType].CARD_HEIGHT / 2 +
      10 * index +
      desiredHeight * index;

    const img = additionalIconImagesWithStatus[index].img;

    const showIcon =
      img &&
      additionalIconImagesWithStatus[index].status === "loaded" &&
      !!card.extraIcons.includes(a.iconId);

    const icon = showIcon ? (
      <Rect
        key={`${card.id}-${a.iconId}-icon`}
        x={iconX}
        y={iconY}
        scale={{
          x: desiredWidth / img.naturalWidth,
          y: desiredHeight / img.naturalHeight,
        }}
        width={img.naturalWidth}
        height={img.naturalHeight}
        fillPatternImage={img}
      ></Rect>
    ) : null;

    if (!!icon) {
      nodesToRender.push(icon);
    }
  });

  return <>{nodesToRender}</>;
};

export default CardModifiersFunctional;
