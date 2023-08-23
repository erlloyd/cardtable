import { KonvaEventObject } from "konva/lib/Node";
import { PlayerColor, myPeerRef } from "./constants/app-constants";
import { CardSizeType, cardConstants } from "./constants/card-constants";
import { GameType } from "./game-modules/GameType";
import { SimpleImage } from "./SimpleImage";
import { Group, Rect } from "react-konva";
import { animated, Spring } from "@react-spring/konva";
import { useCallback, useEffect } from "react";

// There is a bug somewhere in react-konva or react-spring/konva, where, if you use the generic
// `animated` WithAnimations type, you get the following typescript error in typescript ~4.5:
//
// Type instantiation is excessively deep and possibly infinite
//
// We are explicitly casting to an any for now just until this bug is (hopefully) fixed
const AnimatedAny = animated as any;

let lastTap = 0;
const lastTapDelta = 300;

export interface CardTokens {
  damage: number;
  threat: number;
  generic: number;
}
export interface CardUIState {
  stunned: number;
  confused: number;
  tough: number;
  tokens: CardTokens;
}

interface IProps {
  currentGameType: GameType;
  currentPlayerRole: string | null;
  name: string;
  code: string;
  selectedColor: PlayerColor;
  controlledBy: string;
  dragging: boolean;
  shuffling: boolean;
  exhausted: boolean;
  cardState?: CardUIState;
  fill: string;
  disableDragging?: boolean;
  handleClick?: (
    id: string,
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
    wasTouch: boolean
  ) => void;
  handleDoubleClick?: (id: string, event: KonvaEventObject<MouseEvent>) => void;
  handleDoubleTap?: (id: string, event: KonvaEventObject<TouchEvent>) => void;
  handleDragStart?: (id: string, event: KonvaEventObject<DragEvent>) => void;
  handleDragMove?: (info: { id: string; dx: number; dy: number }) => void;
  handleDragEnd?: (id: string, event: KonvaEventObject<DragEvent>) => void;
  handleHover?: (id: string) => void;
  handleHoverLeave?: (id: string) => void;
  handleMouseDownWhenNotDraggable?: (id: string) => void;
  handleMouseUpWhenNotDraggable?: (id: string) => void;
  id: string;
  selected: boolean;
  dropTargetColor?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  imgUrls: string[];
  isGhost?: boolean;
  isPreview?: boolean;
  numCardsInStack?: number;
  typeCode?: string;
  faceup: boolean;
  handleContextMenu?: (
    id: string,
    event: KonvaEventObject<PointerEvent>
  ) => void;
  sizeType: CardSizeType;
  additionalRotation?: number;
}

interface IState {
  showDragHandle: boolean;
  images: HTMLImageElement[];
  imageLoadFailed: number;
  prevImgUrls: string[];
  tokenImagesLoaded: {
    stunned: boolean;
    confused: boolean;
    tough: boolean;
  };
  dragImageLoaded: boolean;
}

const Card = (props: IProps) => {
  // set up shuffling effect
  useEffect(() => {
    console.log("SHUFFLING");
  }, [props.shuffling]);

  // HANDLERS
  const handleClick = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const time = new Date().getTime();
      const delta = time - lastTap;
      lastTap = time;
      if (delta < lastTapDelta) {
        console.log("detected double");
        handleDoubleClick(event);
      } else {
        console.log("detected single");
        handleTapOrClick(event, props.id, false, props.handleClick);
      }
    },
    [props.handleClick, props.id]
  );

  const handleTap = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      const time = new Date().getTime();
      const delta = time - lastTap;
      lastTap = time;
      if (delta < lastTapDelta) {
        console.log("detected double");
        handleDoubleTap(event);
      } else {
        handleTapOrClick(event, props.id, true, props.handleClick);
      }
    },
    [props.handleClick, props.id]
  );

  const handleDoubleClick = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      if (props.handleDoubleClick) {
        // this.setState({ showDragHandle: false });
        props.handleDoubleClick(props.id, event);
        event.cancelBubble = true;
      }
    },
    [props.handleDoubleClick, props.id]
  );

  const handleDoubleTap = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      if (props.handleDoubleTap) {
        // this.setState({ showDragHandle: false });
        props.handleDoubleTap(props.id, event);
        event.cancelBubble = true;
      }
    },
    [props.handleDoubleTap, props.id]
  );

  // console.log(props.selected);

  const heightToUse = props.height || cardConstants[props.sizeType].CARD_HEIGHT;
  const widthToUse = props.width || cardConstants[props.sizeType].CARD_WIDTH;

  const offset = {
    x: widthToUse / 2,
    y: heightToUse / 2,
  };

  const cardStackOffset = {
    x: 6,
    y: -6,
  };

  const cardStack =
    (props.numCardsInStack || 1) > 1 ? (
      <Rect
        cornerRadius={[9, 9, 9, 9]}
        width={widthToUse}
        height={heightToUse}
        offset={cardStackOffset}
        opacity={props.isGhost ? 0.5 : 1}
        fill={"gray"}
        shadowForStrokeEnabled={false}
        hitStrokeWidth={0}
      />
    ) : null;

  const card = (
    <SimpleImage
      imgUrls={props.imgUrls}
      width={widthToUse}
      height={heightToUse}
      stroke={getStrokeColor(props)}
      strokeWidth={!!getStrokeColor(props) ? 4 : 0}
    ></SimpleImage>
  );

  const selectedBox = props.selected ? (
    <Rect
      width={widthToUse}
      height={heightToUse}
      cornerRadius={9}
      stroke={"red"}
      strokeWidth={4}
    />
  ) : null;

  return (
    <Spring
      key={`${props.id}-card`}
      to={{
        rotation: props.exhausted ? 90 : 0,
        textRotation: props.exhausted ? -90 : 0,
      }}
    >
      {(animatedProps: any) => (
        <AnimatedAny.Group
          {...animatedProps}
          draggable={
            (props.controlledBy === "" || props.controlledBy === myPeerRef) &&
            !props.disableDragging
          }
          x={props.x}
          y={props.y}
          offset={offset}
          onClick={(e: any) => {
            console.log("handleClick");
            handleClick(e);
          }}
          onTap={handleTap}
        >
          {/* <Group
            onDblClick={(e: any) => {
              console.log("double click");
              handleDoubleClick(e);
            }}
            onDblTap={handleDoubleTap}
          > */}
          {cardStack}
          {card}
          {selectedBox}
          {/* </Group> */}
        </AnimatedAny.Group>
      )}
    </Spring>
  );
};

const handleTapOrClick = (
  event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
  id: string,
  wasTouch: boolean,
  callback?: (
    id: string,
    event: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
    wasTouch: boolean
  ) => void
): void => {
  if (!!callback) {
    callback(id, event, wasTouch);
    event.cancelBubble = true;
  }
};

const getStrokeColor = (props: IProps) => {
  if (!!props.dropTargetColor) {
    return props.dropTargetColor;
  }

  if (props.selected) {
    return props.selectedColor;
  }

  return "";
};

export default Card;
