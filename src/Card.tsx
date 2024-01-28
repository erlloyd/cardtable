import { Spring, animated } from "@react-spring/konva";
import { KonvaEventObject } from "konva/lib/Node";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Group, Rect } from "react-konva";
import { SimpleCardImage } from "./SimpleCardImage";
import { PlayerColor, myPeerRef } from "./constants/app-constants";
import {
  CardSizeType,
  cardConstants,
  stackShuffleAnimationS,
} from "./constants/card-constants";
import { GameType } from "./game-modules/GameType";
import useImage from "use-image";
import CardTokensContainer from "./CardTokensContainer";
import CardModifiersContainer from "./CardModifiersContainer";
import CardStatusToken from "./CardStatusToken";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import GameManager from "./game-modules/GameModuleManager";

const useIsMount = () => {
  const isMountRef = useRef(true);

  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

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
  backLinkCode?: string;
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

const debouncedHandleMove = debounce((event: any, props: IProps) => {
  if (props.handleDragMove && props.dragging) {
    props.handleDragMove({
      id: props.id,
      dx: event.target.x() - props.x,
      dy: event.target.y() - props.y,
    });
  }
}, 5);

const Card = (props: IProps) => {
  const isMount = useIsMount();
  const touchTimerRef = useRef<any>(null);
  const [showDragHandle, setShowDragHandle] = useState(true);
  const shuffleToggleRef = useRef(true);

  // set up shuffling effect
  const shuffleRef = useRef(null);

  useEffect(() => {
    if (!isMount && props.shuffling) {
      const shuffleDeg = props.exhausted ? 360 + 90 : 360;
      if (shuffleRef?.current) {
        (shuffleRef.current as any).to({
          rotation:
            getCurrentRotation(props) +
            (shuffleToggleRef.current ? shuffleDeg : -1 * shuffleDeg),
          duration: stackShuffleAnimationS,
        });

        shuffleToggleRef.current = !shuffleToggleRef.current;
      } else {
        console.error("Shuffle reference doesn't exist!");
      }
    }
  }, [props.shuffling, props.exhausted]);

  // set up draghandle hiding
  useEffect(() => {
    if (!isMount) {
      setShowDragHandle(false);
    }
  }, [props.exhausted]);

  // Images
  const [dragImg, dragImgStatus] = useImage("/images/standard/share.png");

  // HANDLERS
  const handleClick = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const time = new Date().getTime();
      const delta = time - lastTap;
      lastTap = time;
      if (delta < lastTapDelta) {
        handleDoubleClick(event);
      } else {
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
        handleDoubleTap(event);
      } else {
        handleTapOrClick(event, props.id, true, props.handleClick);
      }
    },
    [props.handleClick, props.id]
  );

  const handleDoubleClick = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      setShowDragHandle(false);
      if (props.handleDoubleClick) {
        props.handleDoubleClick(props.id, event);
        event.cancelBubble = true;
      }
    },
    [props.handleDoubleClick, props.id]
  );

  const handleDoubleTap = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      // If we hide the drag handle, it doesn't come
      // back because in touch mode double tap doesn't
      // rotate the card
      // setShowDragHandle(false);
      if (props.handleDoubleTap) {
        props.handleDoubleTap(props.id, event);
        event.cancelBubble = true;
      }
    },
    [props.handleDoubleTap, props.id]
  );

  const handleDragStart = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      if (props.handleDragStart) {
        props.handleDragStart(props.id, event);
      }
    },
    [props.handleDragStart, props.id]
  );

  // Moved this a bit - I'd like to not make a new function
  // every time, but memoizing the debounce seems to cause some issues

  // const handleDragMove = useCallback(
  //   debounce((event: any) => {
  //     // only do this if we are dragging - otherwise we can get
  //     // some extra instances of this from debouncing.
  //     if (props.handleDragMove && props.dragging) {
  //       console.log("MOVING");
  //       props.handleDragMove({
  //         id: props.id,
  //         dx: event.target.x() - props.x,
  //         dy: event.target.y() - props.y,
  //       });
  //     }
  //   }, 0),
  //   [props.handleDragMove, props.id, props.x, props.y, props.dragging]
  // );

  const handleDragEnd = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      if (props.handleDragEnd && props.dragging) {
        // First make sure the cursor is back to normal
        window.document.body.style.cursor = "grab";

        // Next, cancel any outstanding move things that haven't debounced
        // handleDragMove.cancel();
        debouncedHandleMove.cancel();

        props.handleDragEnd(props.id, event);
      }
    },
    [props.handleDragEnd, props.dragging, props.id]
  );

  const handleHover = useCallback(() => {
    window.document.body.style.cursor = "grab";
    if (props.handleHover) {
      props.handleHover(props.id);
    }
  }, [props.handleHover, props.id]);

  const handleHoverLeave = useCallback(() => {
    window.document.body.style.cursor = "default";
    if (props.handleHoverLeave) {
      props.handleHoverLeave(props.id);
    }
  }, [props.handleHoverLeave, props.id]);

  const handleContextMenu = useCallback(
    (event: KonvaEventObject<PointerEvent>) => {
      if (!!props.handleContextMenu) {
        props.handleContextMenu(props.id, event);
      }
    },
    [props.handleContextMenu, props.id]
  );

  const handleMouseDown = useCallback(
    (event: any) => {
      event.cancelBubble = true;
      if (props.handleMouseDownWhenNotDraggable && !!props.disableDragging) {
        props.handleMouseDownWhenNotDraggable(props.id);
      }
    },
    [props.handleMouseDownWhenNotDraggable, props.disableDragging, props.id]
  );

  const handleMouseUp = useCallback(() => {
    if (props.handleMouseUpWhenNotDraggable && !!props.disableDragging) {
      props.handleMouseUpWhenNotDraggable(props.id);
    }
  }, [props.handleMouseUpWhenNotDraggable, props.disableDragging, props.id]);

  const handleTouchStart = useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      event.cancelBubble = true;
      if (!!touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }

      touchTimerRef.current = setTimeout(() => {
        handleContextMenu(event as unknown as KonvaEventObject<PointerEvent>);
      }, 750);
    },
    []
  );

  const handleTouchMove = useCallback(() => {
    if (!!touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!!touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    if (!!props.handleMouseUpWhenNotDraggable) {
      props.handleMouseUpWhenNotDraggable(props.id);
    }
  }, [props.handleMouseUpWhenNotDraggable, props.id]);

  // RENDERABLE PIECES

  // Global location calculations
  const heightToUse = props.height || cardConstants[props.sizeType].CARD_HEIGHT;
  const widthToUse = props.width || cardConstants[props.sizeType].CARD_WIDTH;

  const offset = {
    x: widthToUse / 2,
    y: heightToUse / 2,
  };

  // CARD STACK INDICATOR

  const cardStackOffset = {
    x: offset.x + 6,
    y: offset.y - 6,
  };

  const cardStackLocation = {
    x: offset.x,
    y: offset.y,
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
        x={cardStackLocation.x}
        y={cardStackLocation.y}
      />
    ) : null;

  // GHOST CARD FOR SNAP TO GRID
  const gridGhostCard =
    props.isGhost && props.imgUrls.length === 0 ? (
      <Rect
        cornerRadius={[9, 9, 9, 9]}
        width={widthToUse}
        height={heightToUse}
        opacity={0.5}
        fill={"gray"}
      />
    ) : null;

  // ACTUAL CARD ITSELF
  const card = (
    <SimpleCardImage
      imageRef={shuffleRef}
      imgUrls={props.imgUrls}
      width={widthToUse}
      height={heightToUse}
      selected={props.selected}
      selectedColor={props.selectedColor}
      opacity={props.isGhost ? 0.5 : 1}
      dropTargetColor={props.dropTargetColor}
      name={props.name}
      code={
        !!props.backLinkCode && !props.faceup ? props.backLinkCode : props.code
      }
    ></SimpleCardImage>
  );

  // CARD COUNT TEXT
  const countDim = 40;

  const stackCountMainOffset = {
    x: -widthToUse / 2,
    y: 0,
  };

  const stackCountoffset = {
    x: 20,
    y: 20,
  };

  const cardStackCount =
    (props.numCardsInStack || 1) > 1 && !props.isGhost ? (
      <Spring
        key={`${props.id}-cardStackCount`}
        to={{
          textRotation: props.exhausted ? -90 : 0,
        }}
      >
        {(animatedProps: any) => (
          <AnimatedAny.Group
            width={countDim}
            height={countDim}
            offset={stackCountMainOffset}
            {...animatedProps}
          >
            <AnimatedAny.Group width={countDim} height={countDim}>
              <AnimatedAny.Rect
                offset={stackCountoffset}
                cornerRadius={[9, 9, 9, 9]}
                opacity={0.6}
                fill={"black"}
                shadowForStrokeEnabled={false}
                hitStrokeWidth={0}
                width={countDim}
                height={countDim}
              />
              <AnimatedAny.Text
                rotation={animatedProps.textRotation}
                offset={stackCountoffset}
                key={`${props.id}-cardstackcounttext`}
                width={countDim}
                height={countDim}
                verticalAlign={"middle"}
                align={"center"}
                fontSize={(props.numCardsInStack || 1) > 99 ? 18 : 24}
                fill={"white"}
                text={`${props.numCardsInStack}`}
              />
            </AnimatedAny.Group>
          </AnimatedAny.Group>
        )}
      </Spring>
    ) : null;

  // DRAG HANDLE
  const dragHandleSize = 40;
  const dragHandleMainOffset = {
    x: props.exhausted ? 0 : -widthToUse + dragHandleSize,
    y: 0,
  };

  const dragHandleOffset = {
    x: 0,
    y: 0,
  };

  const cardStackDragHandle =
    (props.numCardsInStack || 1) > 1 &&
    !props.isGhost &&
    showDragHandle &&
    dragImgStatus === "loaded" &&
    !!dragImg ? (
      <Group
        width={dragHandleSize}
        height={dragHandleSize}
        offset={dragHandleMainOffset}
        onMouseEnter={() => {
          window.document.body.style.cursor = "ne-resize";
        }}
        onMouseLeave={() => {
          window.document.body.style.cursor = "default";
        }}
      >
        <Rect
          offset={dragHandleOffset}
          cornerRadius={[9, 9, 9, 9]}
          opacity={0.6}
          fill={"black"}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={0}
          width={dragHandleSize}
          height={dragHandleSize}
        />
        <Image
          rotation={props.exhausted ? -90 : 0}
          offset={{ x: dragHandleSize / 2, y: dragHandleSize / 2 }}
          x={dragHandleSize / 2}
          y={dragHandleSize / 2}
          image={dragImg}
          width={dragHandleSize}
          height={dragHandleSize}
        />
      </Group>
    ) : null;

  const tokenInfo = GamePropertiesMap[props.currentGameType].tokens;
  // CARD STATUS TOKEN - STUNNED
  const shouldRenderStunned = !!props.cardState?.stunned && !!tokenInfo.stunned;

  const stunnedStatusToken = shouldRenderStunned ? (
    <CardStatusToken
      id={props.id}
      imgUrl={tokenInfo.stunned?.imagePath || ""}
      numberToRender={props.cardState?.stunned || 0}
      offset={{ x: 0, y: 0 }}
      slot={0}
      sizeType={props.sizeType}
    />
  ) : null;

  // CARD STATUS TOKEN - CONFUSED
  const shouldRenderConfused =
    !!props.cardState?.confused && !!tokenInfo.confused;

  const confusedStatusToken = shouldRenderConfused ? (
    <CardStatusToken
      id={props.id}
      imgUrl={tokenInfo.confused?.imagePath || ""}
      numberToRender={props.cardState?.confused || 0}
      offset={{ x: 0, y: 0 }}
      slot={1}
      sizeType={props.sizeType}
    />
  ) : null;

  // CARD STATUS TOKEN - STUNNED
  const shouldRenderTough = !!props.cardState?.tough && !!tokenInfo.tough;

  const toughStatusToken = shouldRenderTough ? (
    <CardStatusToken
      id={props.id}
      imgUrl={tokenInfo.tough?.imagePath || ""}
      numberToRender={props.cardState?.tough || 0}
      offset={{ x: 0, y: 0 }}
      slot={2}
      sizeType={props.sizeType}
    />
  ) : null;

  // CARD TOKENS
  const cardTokens =
    props.dragging || props.isGhost || props.isPreview ? null : (
      <CardTokensContainer
        currentGameType={props.currentGameType}
        key={`${props.id}-cardTokens`}
        id={props.id}
        x={widthToUse / 2}
        y={heightToUse / 2}
      ></CardTokensContainer>
    );

  // CARD MODIFIERS
  const cardModifiers =
    props.dragging || props.isGhost || props.isPreview ? null : (
      <CardModifiersContainer
        currentGameType={props.currentGameType}
        key={`${props.id}-cardModifiers`}
        id={props.id}
        x={widthToUse / 2}
        y={heightToUse / 2}
        cardHeight={props.height}
        cardWidth={props.width}
        isPreview={!!props.isPreview}
      ></CardModifiersContainer>
    );
  // FINAL RENDER
  return (
    <Spring
      key={`${props.id}-card`}
      to={{
        rotation: getCurrentRotation(props),
        textRotation: props.exhausted ? -90 : 0,
      }}
      onRest={() => {
        setShowDragHandle(true);
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
          onClick={handleClick}
          onTap={handleTap}
          onDragStart={handleDragStart}
          onDragMove={(e: any) => debouncedHandleMove(e, props)}
          onDragEnd={handleDragEnd}
          onMouseOver={handleHover}
          onMouseOut={handleHoverLeave}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {cardStack}
          {card}
          {cardStackCount}
          {cardStackDragHandle}
          {cardTokens}
          {stunnedStatusToken}
          {confusedStatusToken}
          {toughStatusToken}
          {cardModifiers}
          {gridGhostCard}
        </AnimatedAny.Group>
      )}
    </Spring>
  );
};

const getCurrentRotation = (props: IProps) => {
  return (
    (props.exhausted ? 90 : 0) +
    (props.additionalRotation ?? 0) +
    GameManager.getModuleForType(
      props.currentGameType
    ).additionalRotationForCardForRole(
      props.currentPlayerRole ?? "",
      props.code,
      props.faceup,
      props.typeCode
    )
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

export default Card;
