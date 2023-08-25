import { Group, Rect, Text } from "react-konva";
import useImage from "use-image";
import { CardSizeType, cardConstants } from "./constants/card-constants";

interface IProps {
  id: string;
  imgUrl: string;
  offset: { x: number; y: number };
  sizeType: CardSizeType;
  slot: number;
  numberToRender: number;
}

const CardStatusToken = (props: IProps) => {
  const [img, status] = useImage(props.imgUrl);

  const dimensions = img
    ? {
        width: img.naturalWidth / 2,
        height: img.naturalHeight / 2,
      }
    : { width: 0, height: 0 };

  const stunnedOffset = {
    x:
      props.offset.x -
      cardConstants[props.sizeType].CARD_WIDTH +
      dimensions.width / 2,
    y:
      props.offset.y -
      dimensions.height * props.slot -
      5 * (props.slot + 1) -
      10,
  };

  const textOffset = {
    x: stunnedOffset.x - 5,
    y: stunnedOffset.y - 5,
  };

  const numberText =
    props.numberToRender > 1 ? (
      <Group width={20} height={20} offset={textOffset}>
        <Rect width={20} height={20} fill="white"></Rect>
        <Text
          width={20}
          height={20}
          text={`${props.numberToRender}`}
          fill="black"
          background="white"
          align="center"
          verticalAlign="middle"
          fontSize={20}
        ></Text>
      </Group>
    ) : null;

  return img && status === "loaded" ? (
    <Group
      width={dimensions.width}
      height={dimensions.height}
      key={`${props.id}-status${props.slot}-group`}
    >
      <Rect
        key={`${props.id}-status${props.slot}`}
        native={true}
        cornerRadius={8}
        width={dimensions.width}
        height={dimensions.height}
        fillPatternScaleX={0.5}
        fillPatternScaleY={0.5}
        offset={stunnedOffset}
        fillPatternImage={img}
      />
      {numberText}
    </Group>
  ) : null;
};

export default CardStatusToken;
