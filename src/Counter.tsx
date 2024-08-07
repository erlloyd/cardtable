import { Component } from "react";
import { Vector2d } from "konva/lib/types";
import { Circle, Group, Rect, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { PlayerColor } from "./constants/app-constants";
import { ConfirmOptions, useConfirm } from "material-ui-confirm";

// Wrapper for hook stuff
const withConfirm = (Component: any) => {
  return function WrappedComponent(props: IProps) {
    const confirm = useConfirm();
    return <Component {...props} confirm={confirm} />;
  };
};

interface IProps {
  confirm?: (options?: ConfirmOptions) => Promise<void>;
  id: string;
  pos: Vector2d;
  value: number;
  color: PlayerColor;
  updateCounterValueBy: (amount: number) => void;
  handleContextMenu: (event: KonvaEventObject<PointerEvent>) => void;
  onDragEnd: (event: KonvaEventObject<DragEvent>) => void;
  counterImageUrl?: string;
  counterText?: string;
}

interface IState {
  counterImageLoaded: boolean;
  hoveredOverOptions: boolean;
}

class Counter extends Component<IProps, IState> {
  static whyDidYouRender = false;
  private touchTimer: any = null;
  private unmounted: boolean;
  private img: HTMLImageElement;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      counterImageLoaded: false,
      hoveredOverOptions: false,
    };

    this.img = new Image();

    this.img.onload = () => {
      if (!this.unmounted) {
        this.setState({
          counterImageLoaded: true,
        });
      }
    };

    if (!!this.props.counterImageUrl) {
      this.img.src = this.props.counterImageUrl;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (
      !this.state.counterImageLoaded &&
      !prevProps.counterImageUrl &&
      !!this.props.counterImageUrl
    ) {
      this.img.src = this.props.counterImageUrl;
    }
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const hasImage = !!this.props.counterImageUrl;
    let hasText = !!this.props.counterText;

    const hasAdditionalDisplay = hasImage || hasText;

    if (hasImage && hasText) {
      console.warn(
        "Counter was created with both image and text. Image will be used"
      );
      hasText = false;
    }

    const desiredImageDim = 50;

    const containerWidth = 200;
    const containerHeight = 100;

    const scale = {
      x: desiredImageDim / this.img.naturalWidth,
      y: desiredImageDim / this.img.naturalHeight,
    };

    const offsetX = -containerWidth / 2 + desiredImageDim / 2;
    const scaledOffsetX = offsetX / scale.x;

    const offsetY = -containerHeight / 2 + 5;
    const scaledOffsetY = offsetY / scale.y;

    return (
      <Group
        x={this.props.pos.x}
        y={this.props.pos.y}
        draggable={true}
        onContextMenu={this.props.handleContextMenu}
        onDragEnd={this.props.onDragEnd}
        onTouchStart={this.handleTouchStart}
        onMouseDown={this.cancelBubble}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        onMouseEnter={this.handleMouseEnterCounter}
        onMouseLeave={this.handleMouseLeaveCounter}
      >
        <Rect
          cornerRadius={30}
          width={containerWidth}
          height={containerHeight}
          fill={this.props.color}
        ></Rect>

        <Text
          width={containerWidth}
          height={containerHeight}
          fontSize={36}
          text={`${this.props.value}`}
          align={"center"}
          verticalAlign={"middle"}
          offsetY={hasAdditionalDisplay ? 20 : 0}
        ></Text>
        {hasImage && this.state.counterImageLoaded && (
          <Rect
            key={`${this.props.id}-img`}
            offsetX={scaledOffsetX}
            offsetY={scaledOffsetY}
            scale={scale}
            width={this.img.naturalWidth}
            height={this.img.naturalHeight}
            fillPatternImage={this.img}
          ></Rect>
        )}
        {hasText && (
          <Text
            key={`${this.props.id}-addl-text`}
            width={containerWidth}
            height={containerHeight}
            fillPatternImage={this.img}
            fontSize={24}
            text={`${this.props.counterText}`}
            align={"center"}
            verticalAlign={"bottom"}
            offsetY={5}
          ></Text>
        )}
        <Text
          x={10}
          y={25}
          width={50}
          height={50}
          fontSize={36}
          text={`-`}
          align={"center"}
          verticalAlign={"middle"}
          onClick={this.handleDecrement}
          onTap={this.handleDecrement}
        ></Text>
        <Text
          x={140}
          y={25}
          width={50}
          height={50}
          fontSize={36}
          text={`+`}
          align={"center"}
          verticalAlign={"middle"}
          onClick={this.handleIncrement}
          onTap={this.handleIncrement}
        ></Text>

        <Group
          width={30}
          onClick={this.props.handleContextMenu}
          onTap={this.props.handleContextMenu}
          onMouseEnter={this.handleMouseEnterMenuButton}
          onMouseLeave={this.handleMouseLeaveMenuButton}
        >
          <Circle
            width={30}
            height={30}
            stroke={"black"}
            fill={this.state.hoveredOverOptions ? "grey" : "white"}
            opacity={0.5}
            align={"center"}
            verticalAlign={"middle"}
            offsetY={-20}
            offsetX={-25}
          ></Circle>
          <Text
            width={30}
            height={30}
            fontSize={24}
            text={"..."}
            align={"center"}
            verticalAlign={"middle"}
            offsetX={-10}
            offsetY={1}
          ></Text>
        </Group>
      </Group>
    );
  }

  private cancelBubble = (event: KonvaEventObject<MouseEvent>) => {
    event.cancelBubble = true;
  };

  private handleDecrement = () => {
    this.props.updateCounterValueBy(-1);
  };

  private handleIncrement = () => {
    this.props.updateCounterValueBy(1);
  };

  private handleTouchStart = (event: KonvaEventObject<TouchEvent>) => {
    event.cancelBubble = true;
    if (!!this.touchTimer) {
      clearTimeout(this.touchTimer);
      this.touchTimer = null;
    }

    this.touchTimer = setTimeout(() => {
      this.props.handleContextMenu(
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

  private handleMouseEnterCounter = (event: KonvaEventObject<MouseEvent>) => {
    window.document.body.style.cursor = "grab";
  };

  private handleMouseLeaveCounter = (event: KonvaEventObject<MouseEvent>) => {
    window.document.body.style.cursor = "default";
  };

  private handleMouseEnterMenuButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverOptions: true });
    window.document.body.style.cursor = "pointer";
  };

  private handleMouseLeaveMenuButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverOptions: false });
    window.document.body.style.cursor = "grab";
  };
}

export default withConfirm(Counter);
