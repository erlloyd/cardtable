// tslint:disable:no-console
import { KonvaEventObject } from "konva/types/Node";
import * as React from "react";
import { Component } from "react";
import { Rect } from "react-konva";
import CardTokensContainer from "./CardTokensContainer";
import { myPeerRef, PlayerColor } from "./constants/app-constants";
import { cardConstants } from "./constants/card-constants";

export const HORIZONTAL_TYPE_CODES = ["main_scheme", "side_scheme"];

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
  name: string;
  selectedColor: PlayerColor;
  controlledBy: string;
  dragging: boolean;
  exhausted: boolean;
  cardState?: CardUIState;
  fill: string;
  handleClick?: (id: string, event: KonvaEventObject<MouseEvent>) => void;
  handleDoubleClick?: (id: string, event: KonvaEventObject<MouseEvent>) => void;
  handleDragStart?: (id: string, event: KonvaEventObject<DragEvent>) => void;
  handleDragMove?: (info: { id: string; dx: number; dy: number }) => void;
  handleDragEnd?: (id: string) => void;
  handleHover?: (id: string) => void;
  handleHoverLeave?: (id: string) => void;
  id: string;
  selected: boolean;
  dropTarget?: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  imgUrls: { primary: string; backup: string };
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
  prevImgUrl: string;
  tokenImagesLoaded: {
    stunned: boolean;
    confused: boolean;
    tough: boolean;
  };
}

class Card extends Component<IProps, IState> {
  // tslint:disable-next-line:member-access
  static getDerivedStateFromProps(props: IProps, state: IState): IState | null {
    if (props.imgUrls.primary !== state.prevImgUrl) {
      return {
        imageLoaded: false,
        prevImgUrl: props.imgUrls.primary,
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

  private img: HTMLImageElement;
  private stunnedImg: HTMLImageElement;
  private confusedImg: HTMLImageElement;
  private toughImg: HTMLImageElement;
  private unmounted: boolean;
  private usingBackup = false;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      imageLoaded: false,
      prevImgUrl: this.props.imgUrls.primary,
      tokenImagesLoaded: {
        stunned: false,
        confused: false,
        tough: false,
      },
    };

    this.img = new Image();
    this.stunnedImg = new Image();
    this.confusedImg = new Image();
    this.toughImg = new Image();

    // When the image loads, set a flag in the state
    this.img.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imageLoaded: true,
        });
      }
    };

    this.img.onerror = () => {
      // console.log("error loading " + this.img.src + " for " + this.props.name);
      // console.log("now going to load " + this.props.imgUrls.backup);
      this.img.src = this.props.imgUrls.backup;
    };

    if (props.imgUrls.primary) {
      this.img.src = props.imgUrls.primary;
    }

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

    if (!!props.cardState?.stunned) {
      this.stunnedImg.src =
        process.env.PUBLIC_URL + "/images/standard/stunned.png";
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

    if (!!props.cardState?.confused) {
      this.confusedImg.src =
        process.env.PUBLIC_URL + "/images/standard/confused.png";
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

    if (!!props.cardState?.tough) {
      this.toughImg.src = process.env.PUBLIC_URL + "/images/standard/tough.png";
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      !this.state.imageLoaded &&
      this.props.imgUrls.primary &&
      this.props.imgUrls.primary !== this.img.src
    ) {
      this.img.src = this.props.imgUrls.primary;
    }

    // STUNNED
    if (
      !this.state.tokenImagesLoaded.stunned &&
      !prevProps.cardState?.stunned &&
      !!this.props.cardState?.stunned
    ) {
      this.stunnedImg.src =
        process.env.PUBLIC_URL + "/images/standard/stunned.png";
    }

    // CONFUSED
    if (
      !this.state.tokenImagesLoaded.confused &&
      !prevProps.cardState?.confused &&
      !!this.props.cardState?.confused
    ) {
      this.confusedImg.src =
        process.env.PUBLIC_URL + "/images/standard/confused.png";
    }

    // TOUGH
    if (
      !this.state.tokenImagesLoaded.tough &&
      !prevProps.cardState?.tough &&
      !!this.props.cardState?.tough
    ) {
      this.toughImg.src = process.env.PUBLIC_URL + "/images/standard/tough.png";
    }
  }

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

  private renderUnanimatedCard = (
    heightToUse: number,
    widthToUse: number,
    imageLoaded: boolean
  ) => {
    const scale = this.getScale(widthToUse, heightToUse);
    const offset = {
      x: widthToUse / 2,
      y: heightToUse / 2,
    };

    const card = (
      <Rect
        key={`${this.props.id}-card`}
        native={true}
        rotation={this.props.exhausted ? 90 : 0}
        cornerRadius={9}
        x={this.props.x}
        y={this.props.y}
        width={widthToUse}
        height={heightToUse}
        offset={offset}
        stroke={this.props.dropTarget ? "blue" : ""}
        strokeWidth={this.props.dropTarget ? 2 : 0}
        fillPatternRotation={
          !imageLoaded ||
          this.shouldRenderImageHorizontal(
            this.props.typeCode || "",
            HORIZONTAL_TYPE_CODES
          )
            ? 270
            : 0
        }
        fillPatternImage={imageLoaded ? this.img : undefined}
        fillPatternScaleX={scale.width}
        fillPatternScaleY={scale.height}
        fill={imageLoaded ? undefined : "gray"}
        shadowColor={
          !!this.props.controlledBy ? this.props.selectedColor : "black"
        }
        shadowBlur={this.props.dragging ? 20 : this.props.selected ? 10 : 0}
        opacity={this.props.isGhost ? 0.5 : 1}
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
      />
    );

    const cardStackOffset = {
      x: offset.x + 4,
      y: offset.y - 4,
    };

    const cardStack =
      (this.props.numCardsInStack || 1) > 1 ? (
        <Rect
          key={`${this.props.id}-cardStack`}
          native={true}
          rotation={this.props.exhausted ? 90 : 0}
          cornerRadius={[9, 9, 9, 9]}
          x={this.props.x}
          y={this.props.y}
          width={widthToUse}
          height={heightToUse}
          offset={cardStackOffset}
          opacity={this.props.isGhost ? 0.5 : 1}
          fill={"gray"}
          shadowBlur={this.props.dragging ? 10 : this.props.selected ? 5 : 0}
        />
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
          key={`${this.props.id}-cardTokens`}
          id={this.props.id}
          x={this.props.x}
          y={this.props.y}
        ></CardTokensContainer>
      );

    return [
      cardStack,
      card,
      stunnedToken,
      confusedToken,
      toughToken,
      cardTokens,
    ];
  };

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
    type: string,
    typeCodes: string[]
  ): boolean {
    return typeCodes.includes(type) && !this.plainCardBack;
  }

  private get plainCardBack() {
    return (
      this.props.imgUrls?.backup.includes("standard") &&
      this.props.imgUrls?.backup.includes("_back")
    );
  }

  private getScale(widthToUse: number, heightToUse: number) {
    const width = this.state.imageLoaded
      ? widthToUse / this.img.naturalWidth
      : widthToUse;

    const widthHorizontal = this.state.imageLoaded
      ? heightToUse / this.img.naturalWidth
      : widthToUse;

    const height = this.state.imageLoaded
      ? heightToUse / this.img.naturalHeight
      : heightToUse;

    const heightHorizontal = this.state.imageLoaded
      ? widthToUse / this.img.naturalHeight
      : heightToUse;

    return this.shouldRenderImageHorizontal(
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
