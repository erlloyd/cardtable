import { Vector2d } from "konva/lib/types";
import { Group } from "react-konva";
import Arrow from "./Arrow";
import { cardConstants } from "./constants/card-constants";
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
        ?.map((arrowData, index) => {
          const start = getPointFromCards(arrowData.startCardId, props.cards);
          const end = arrowData.endCardId
            ? getPointFromCards(arrowData.endCardId, props.cards, true)
            : adjustEndPositionForDrawing(arrowData.endArrowPosition);

          return start && end ? (
            <Arrow
              key={`arrow-index-${index}`}
              startPoint={start}
              endPoint={end}
            ></Arrow>
          ) : null;
        })
        .filter((a) => !!a)}
    </Group>
  );
};

const getPointFromCards = (
  cardId: string,
  cards: ICardStack[],
  alignToBottom?: boolean
): Vector2d | null => {
  const card = cards.find((c) => c.id === cardId);
  let returnPos = !!card ? { x: card.x, y: card.y } : null;
  if (!!returnPos && alignToBottom) {
    returnPos.y += cardConstants.CARD_HEIGHT / 2;
  }

  return returnPos;
};

const adjustEndPositionForDrawing = (point?: Vector2d | null) => {
  if (!!point) {
    return { x: point.x - 50, y: point.y + 50 };
  }

  return null;
};

export default CurvedArrows;
