// tslint:disable:no-console
import { KonvaEventObject } from "konva/lib/Node";
import { Rect as RectRef } from "konva/lib/shapes/Rect";
import { Vector2d } from "konva/lib/types";
import * as React from "react";
import { Component } from "react";
import { Rect, Text } from "react-konva";
import { animated, Spring } from "@react-spring/konva";
import CardTokensContainer from "./CardTokensContainer";
import { GameType, myPeerRef, PlayerColor } from "./constants/app-constants";
import { cardConstants } from "./constants/card-constants";
import { CARD_ALREADY_ROTATED_MAP } from "./constants/card-missing-image-map";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";

export const HORIZONTAL_TYPE_CODES = [
  "main_scheme",
  "side_scheme",
  "quest",
  "player_side_quest",
];

export interface CardTokens {
  damage: number;
  threat: number;
  generic: number;
}

export interface CardUIState {
  stunned: boolean;
  confused: boolean;
  tough: boolean;
  tokens: CardTokens;
}

interface IProps {
  currentGameType: GameType;
  name: string;
  code: string;
  selectedColor: PlayerColor;
  controlledBy: string;
  dragging: boolean;
  shuffling: boolean;
  exhausted: boolean;
  cardState?: CardUIState;
  fill: string;
  handleClick?: (id: string, event: KonvaEventObject<MouseEvent>) => void;
  handleDoubleClick?: (id: string, event: KonvaEventObject<MouseEvent>) => void;
  handleDoubleTap?: (id: string, event: KonvaEventObject<TouchEvent>) => void;
  handleDragStart?: (id: string, event: KonvaEventObject<DragEvent>) => void;
  handleDragMove?: (info: { id: string; dx: number; dy: number }) => void;
  handleDragEnd?: (id: string) => void;
  handleHover?: (id: string) => void;
  handleHoverLeave?: (id: string) => void;
  id: string;
  selected: boolean;
  dropTargetColor?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  imgUrls: string[];
  isGhost?: boolean;
  numCardsInStack?: number;
  typeCode?: string;
  faceup: boolean;
  handleContextMenu?: (
    id: string,
    event: KonvaEventObject<PointerEvent>
  ) => void;
}

interface IState {
  imageLoaded: boolean;
  imageLoadFailed: number;
  prevImgUrls: string[];
  tokenImagesLoaded: {
    stunned: boolean;
    confused: boolean;
    tough: boolean;
  };
}

const stringArraysEqual = (array1: string[], array2: string[]) => {
  return (
    array1.length === array2.length &&
    array1.every((value, index) => {
      return value === array2[index];
    })
  );
};

class Card extends Component<IProps, IState> {
  // tslint:disable-next-line:member-access
  static getDerivedStateFromProps(props: IProps, state: IState): IState | null {
    if (!stringArraysEqual(props.imgUrls, state.prevImgUrls ?? [])) {
      return {
        imageLoaded: false,
        imageLoadFailed: 0,
        prevImgUrls: props.imgUrls,
        tokenImagesLoaded: {
          stunned: state.tokenImagesLoaded.stunned,
          confused: state.tokenImagesLoaded.confused,
          tough: state.tokenImagesLoaded.tough,
        },
      };
    }
    // No state update necessary
    return null;
  }

  private imgs: HTMLImageElement[] = [];
  private stunnedImg: HTMLImageElement;
  private confusedImg: HTMLImageElement;
  private toughImg: HTMLImageElement;
  private unmounted: boolean;
  private touchTimer: any = null;
  private rect: RectRef | null = null;
  private shuffleToggle = false;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      imageLoaded: false,
      imageLoadFailed: 0,
      prevImgUrls: this.props.imgUrls,
      tokenImagesLoaded: {
        stunned: false,
        confused: false,
        tough: false,
      },
    };

    this.initCardImages(props);

    this.stunnedImg = new Image();
    this.confusedImg = new Image();
    this.toughImg = new Image();

    // STUNNED
    this.stunnedImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          tokenImagesLoaded: {
            stunned: true,
            confused: this.state.tokenImagesLoaded.confused,
            tough: this.state.tokenImagesLoaded.tough,
          },
        });
      }
    };

    const tokenInfo = GamePropertiesMap[props.currentGameType].tokens;

    if (!!props.cardState?.stunned && !!tokenInfo.stunned) {
      this.stunnedImg.src = tokenInfo.stunned.imagePath;
    }

    // CONFUSED
    this.confusedImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          tokenImagesLoaded: {
            stunned: this.state.tokenImagesLoaded.stunned,
            confused: true,
            tough: this.state.tokenImagesLoaded.tough,
          },
        });
      }
    };

    if (!!props.cardState?.confused && !!tokenInfo.confused) {
      this.confusedImg.src = tokenInfo.confused.imagePath;
    }

    // TOUGH
    this.toughImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          tokenImagesLoaded: {
            stunned: this.state.tokenImagesLoaded.stunned,
            confused: this.state.tokenImagesLoaded.confused,
            tough: true,
          },
        });
      }
    };

    if (!!props.cardState?.tough && !!tokenInfo.tough) {
      this.toughImg.src = tokenInfo.tough.imagePath;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    // if we just went from not shuffling -> shuffling, animate
    if (!prevProps.shuffling && this.props.shuffling) {
      if (!!this.rect) {
        this.shuffleToggle = !this.shuffleToggle;
        this.rect.to({
          rotation: this.currentRotation + (this.shuffleToggle ? 360 : -360),
          duration: 0.2,
        });
      }
    }

    if (
      !this.state.imageLoaded &&
      !stringArraysEqual(prevProps.imgUrls, this.props.imgUrls)
    ) {
      this.setState({
        imageLoaded: false,
        imageLoadFailed: 0,
      });
      this.initCardImages(this.props);
    }

    const tokenInfo = GamePropertiesMap[this.props.currentGameType].tokens;

    // STUNNED
    if (
      !this.state.tokenImagesLoaded.stunned &&
      !prevProps.cardState?.stunned &&
      !!this.props.cardState?.stunned &&
      !!tokenInfo.stunned
    ) {
      this.stunnedImg.src = tokenInfo.stunned.imagePath;
    }

    // CONFUSED
    if (
      !this.state.tokenImagesLoaded.confused &&
      !prevProps.cardState?.confused &&
      !!this.props.cardState?.confused &&
      !!tokenInfo.confused
    ) {
      this.confusedImg.src = tokenInfo.confused.imagePath;
    }

    // TOUGH
    if (
      !this.state.tokenImagesLoaded.tough &&
      !prevProps.cardState?.tough &&
      !!this.props.cardState?.tough &&
      !!tokenInfo.tough
    ) {
      this.toughImg.src = tokenInfo.tough.imagePath;
    }
  }

  private initCardImages = (props: IProps) => {
    this.imgs = props.imgUrls.map(() => new Image());

    // When the image loads, set a flag in the state
    this.imgs.forEach(
      (img) =>
        (img.onload = () => {
          if (!this.unmounted) {
            this.setState({
              imageLoaded: true,
            });
          }
        })
    );

    this.imgs.forEach(
      (img) =>
        (img.onerror = () => {
          if (!this.unmounted) {
            this.setState({
              imageLoadFailed: this.state.imageLoadFailed + 1,
            });
          }
        })
    );

    props.imgUrls.forEach((imgUrl, index) => (this.imgs[index].src = imgUrl));
  };

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  public render() {
    return this.renderCard(this.state.imageLoaded);
  }

  private renderCard(imageLoaded: boolean) {
    const heightToUse = this.props.height || cardConstants.CARD_HEIGHT;
    const widthToUse = this.props.width || cardConstants.CARD_WIDTH;

    return this.renderUnanimatedCard(heightToUse, widthToUse, imageLoaded);
  }

  // Unfortunately, if you try to use shadow / blur to indicate selection
  // (which I did at first and looks better, imo) the performance in horrible,
  // even with some reccommended settings (shadowForStrokeEnabled = false and
  // hitStrokeWidth = 0). So we'll just use stroke / border for everything
  private getStrokeColor = () => {
    if (!!this.props.dropTargetColor) {
      return this.props.dropTargetColor;
    }

    if (this.props.selected) {
      return this.props.selectedColor;
    }

    return "";
  };

  private renderUnanimatedCard = (
    heightToUse: number,
    widthToUse: number,
    imageLoaded: boolean
  ) => {
    const imgToUse = imageLoaded
      ? this.imgs.find((i) => i.complete && i.naturalHeight !== 0)
      : undefined;

    const scale = this.getScale(imgToUse, widthToUse, heightToUse);
    const offset = {
      x: widthToUse / 2,
      y: heightToUse / 2,
    };

    const card = (
      <Spring
        key={`${this.props.id}-card`}
        to={{
          rotation: this.props.exhausted ? 90 : 0,
        }}
      >
        {(animatedProps: any) => (
          <animated.Rect
            {...animatedProps}
            ref={(node) => {
              if (!!node) {
                this.rect = node;
              }
            }}
            cornerRadius={9}
            x={this.props.x}
            y={this.props.y}
            width={widthToUse}
            height={heightToUse}
            offset={offset}
            stroke={this.getStrokeColor()}
            strokeWidth={!!this.getStrokeColor() ? 4 : 0}
            fillPatternRotation={
              !imageLoaded ||
              this.shouldRenderImageHorizontal(
                this.props.code,
                this.props.typeCode || "",
                HORIZONTAL_TYPE_CODES
              )
                ? 270
                : 0
            }
            fillPatternImage={imgToUse}
            fillPatternScaleX={scale.width}
            fillPatternScaleY={scale.height}
            fill={imageLoaded ? undefined : "gray"}
            shadowForStrokeEnabled={false}
            hitStrokeWidth={0}
            opacity={this.props.isGhost ? 0.5 : 1}
            draggable={
              this.props.controlledBy === "" ||
              this.props.controlledBy === myPeerRef
            }
            onDragStart={this.handleDragStart}
            onDragMove={this.handleDragMove}
            onDragEnd={this.handleDragEnd}
            onDblClick={this.handleDoubleClick}
            onDblTap={this.handleDoubleTap}
            onClick={this.handleClick}
            onTap={this.handleClick}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            onContextMenu={this.handleContextMenu}
          />
        )}
      </Spring>
    );

    const cardStackOffset = {
      x: offset.x + 4,
      y: offset.y - 4,
    };

    const cardStack =
      (this.props.numCardsInStack || 1) > 1 ? (
        <Spring
          key={`${this.props.id}-cardStack`}
          to={{
            rotation: this.props.exhausted ? 90 : 0,
          }}
        >
          {(animatedProps: any) => (
            <animated.Rect
              {...animatedProps}
              cornerRadius={[9, 9, 9, 9]}
              x={this.props.x}
              y={this.props.y}
              width={widthToUse}
              height={heightToUse}
              offset={cardStackOffset}
              opacity={this.props.isGhost ? 0.5 : 1}
              fill={"gray"}
              shadowForStrokeEnabled={false}
              hitStrokeWidth={0}
            />
          )}
        </Spring>
      ) : null;

    const shouldRenderStunned =
      !!this.props.cardState?.stunned && this.state.tokenImagesLoaded.stunned;

    const stunnedToken = this.getTokenInSlot(
      shouldRenderStunned,
      this.stunnedImg,
      offset,
      0
    );
    const confusedToken = this.getTokenInSlot(
      !!this.props.cardState?.confused && this.state.tokenImagesLoaded.confused,
      this.confusedImg,
      offset,
      1
    );
    const toughToken = this.getTokenInSlot(
      !!this.props.cardState?.tough && this.state.tokenImagesLoaded.tough,
      this.toughImg,
      offset,
      2
    );

    const cardTokens =
      this.props.dragging || this.props.isGhost ? null : (
        <CardTokensContainer
          currentGameType={this.props.currentGameType}
          key={`${this.props.id}-cardTokens`}
          id={this.props.id}
          x={this.props.x}
          y={this.props.y}
        ></CardTokensContainer>
      );

    const noImageCardNameText = this.renderCardName(
      offset,
      widthToUse,
      heightToUse
    );

    return [
      cardStack,
      card,
      noImageCardNameText,
      stunnedToken,
      confusedToken,
      toughToken,
      cardTokens,
    ];
  };

  private renderCardName(
    offset: Vector2d,
    cardWidth: number,
    cardHeight: number
  ) {
    const textOffset = { x: offset.x - 10, y: offset.y - 20 };
    const textItem =
      this.state.imageLoadFailed === this.props.imgUrls.length &&
      this.state.imageLoadFailed !== 0 ? (
        <Text
          key={`${this.props.id}-cardnametext`}
          offset={textOffset}
          x={this.props.x}
          y={this.props.y}
          width={cardWidth - 10}
          height={cardHeight - 20}
          fontSize={24}
          text={`${this.props.name} ${this.props.code}`}
          draggable={
            this.props.controlledBy === "" ||
            this.props.controlledBy === myPeerRef
          }
          onDragStart={this.handleDragStart}
          onDragMove={this.handleDragMove}
          onDragEnd={this.handleDragEnd}
          onDblClick={this.handleDoubleClick}
          onDblTap={this.handleDoubleClick}
          onClick={this.handleClick}
          onTap={this.handleClick}
          onMouseDown={this.handleMouseDown}
          onTouchStart={this.handleMouseDown}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onContextMenu={this.handleContextMenu}
        ></Text>
      ) : null;

    return textItem;
  }

  private getTokenInSlot(
    shouldRender: boolean,
    img: HTMLImageElement,
    offset: { x: number; y: number },
    slot: 0 | 1 | 2
  ) {
    const dimensions = {
      width: img.naturalWidth / 2,
      height: img.naturalHeight / 2,
    };

    const stunnedOffset = {
      x: offset.x - cardConstants.CARD_WIDTH + dimensions.width / 2,
      y: offset.y - dimensions.height * slot - 5 * (slot + 1) - 10,
    };

    return shouldRender ? (
      <Rect
        key={`${this.props.id}-status${slot}`}
        native={true}
        cornerRadius={8}
        x={this.props.x}
        y={this.props.y}
        width={dimensions.width}
        height={dimensions.height}
        fillPatternScaleX={0.5}
        fillPatternScaleY={0.5}
        offset={stunnedOffset}
        fillPatternImage={img}
      />
    ) : null;
  }

  private shouldRenderImageHorizontal(
    code: string,
    type: string,
    typeCodes: string[]
  ): boolean {
    const shouldRotateByType =
      typeCodes.includes(type.toLocaleLowerCase()) && !this.plainCardBack;
    return shouldRotateByType && !CARD_ALREADY_ROTATED_MAP[code];
  }

  private get plainCardBack() {
    return (
      this.props.imgUrls.some((i) => i.includes("standard")) &&
      this.props.imgUrls.some((i) => i.includes("_back"))
    );
  }

  private get currentRotation() {
    return this.props.exhausted ? 90 : 0;
  }

  private getScale(
    img: HTMLImageElement | undefined,
    widthToUse: number,
    heightToUse: number
  ) {
    const width = !!img ? widthToUse / img.naturalWidth : widthToUse;

    const widthHorizontal = !!img ? heightToUse / img.naturalWidth : widthToUse;

    const height = !!img ? heightToUse / img.naturalHeight : heightToUse;

    const heightHorizontal = !!img
      ? widthToUse / img.naturalHeight
      : heightToUse;

    return this.shouldRenderImageHorizontal(
      this.props.code,
      this.props.typeCode || "",
      HORIZONTAL_TYPE_CODES
    )
      ? { width: widthHorizontal, height: heightHorizontal }
      : { width, height };
  }

  private handleContextMenu = (event: KonvaEventObject<PointerEvent>): void => {
    if (!!this.props.handleContextMenu) {
      this.props.handleContextMenu(this.props.id, event);
    }
  };

  private handleDoubleClick = (event: KonvaEventObject<MouseEvent>) => {
    if (this.props.handleDoubleClick) {
      this.props.handleDoubleClick(this.props.id, event);
    }
  };

  private handleDoubleTap = (event: KonvaEventObject<TouchEvent>) => {
    if (this.props.handleDoubleTap) {
      this.props.handleDoubleTap(this.props.id, event);
    }
  };

  private handleDragStart = (event: KonvaEventObject<DragEvent>) => {
    if (this.props.handleDragStart) {
      this.props.handleDragStart(this.props.id, event);
    }
  };

  private handleDragMove = (event: any) => {
    if (this.props.handleDragMove) {
      this.props.handleDragMove({
        id: this.props.id,
        dx: event.target.x() - this.props.x,
        dy: event.target.y() - this.props.y,
      });
    }
  };

  private handleDragEnd = () => {
    if (this.props.handleDragEnd && this.props.dragging) {
      this.props.handleDragEnd(this.props.id);
    }
  };

  private handleClick = (event: KonvaEventObject<MouseEvent>) => {
    if (this.props.handleClick) {
      this.props.handleClick(this.props.id, event);
      event.cancelBubble = true;
    }
  };

  private handleMouseDown = (event: any) => {
    event.cancelBubble = true;
  };

  private handleTouchStart = (event: KonvaEventObject<TouchEvent>) => {
    event.cancelBubble = true;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.handleContextMenu(
        event as unknown as KonvaEventObject<PointerEvent>
      );
    }, 750);
  };

  private handleTouchMove = (event: KonvaEventObject<TouchEvent>) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
  };

  private handleTouchEnd = (event: KonvaEventObject<TouchEvent>) => {
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }
  };

  private handleMouseOver = () => {
    if (this.props.handleHover) {
      this.props.handleHover(this.props.id);
    }
  };

  private handleMouseOut = () => {
    if (this.props.handleHoverLeave) {
      this.props.handleHoverLeave(this.props.id);
    }
  };
}

export default Card;
