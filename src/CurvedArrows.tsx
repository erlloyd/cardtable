import { Vector2d } from "konva/lib/types";
import React from "react";
import { Group } from "react-konva";
import Arrow from "./Arrow";
import { IArrow } from "./features/arrows/initialState";
import { ICardStack } from "./features/cards/initialState";
interface IProps {
  arrows?: IArrow[];
  cards: ICardStack[];
}

const CurvedArrows = (props: IProps) => {
  return (
    <Group>
      {props.arrows
        ?.map((arrowData) => {
          const start = getStartPointFromCards(
            arrowData.startCardId,
            props.cards
          );
          const end = arrowData.endArrowPosition;

          return start && end ? (
            <Arrow startPoint={start} endPoint={end}></Arrow>
          ) : null;
        })
        .filter((a) => !!a)}
    </Group>
  );
};

const getStartPointFromCards = (
  cardId: string,
  cards: ICardStack[]
): Vector2d | null => {
  const startCard = cards.find((c) => c.id === cardId);
  return !!startCard ? { x: startCard.x, y: startCard.y } : null;
};

export default CurvedArrows;
