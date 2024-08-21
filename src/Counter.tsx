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
  hoveredOverPlus: boolean;
  hoveredOverMinus: boolean;
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
      hoveredOverPlus: false,
      hoveredOverMinus: false,
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
          cornerRadius={100}
          width={containerWidth}
          height={containerHeight}
          fill={this.props.color}
          // stroke={"black"}
          // strokeWidth={3}
        ></Rect>

        <Text
          width={containerWidth}
          height={containerHeight}
          fontSize={40}
          fontStyle="bold"
          text={`${this.props.value}`}
          fill="white"
          stroke={"black"}
          strokeWidth={6}
          fillAfterStrokeEnabled={true}
          align={"center"}
          verticalAlign={"middle"}
          offsetY={hasText ? 10 : hasImage ? 23 : -2}
          letterSpacing={2}
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
            fontStyle="bold"
            text={`${this.props.counterText}`}
            align={"center"}
            verticalAlign={"bottom"}
            offsetY={10}
          ></Text>
        )}
        <Group
          width={40}
          onClick={this.handleDecrement}
          onTap={this.handleDecrement}
          onMouseEnter={this.handleMouseEnterMinusButton}
          onMouseLeave={this.handleMouseLeaveMinusButton}
          offsetY={hasText ? 10 : 0}
        >
          <Circle
            width={40}
            height={40}
            fill={this.state.hoveredOverMinus ? "white" : "#e0e0e0"}
            align={"center"}
            verticalAlign={"middle"}
            x={30}
            y={50}
            stroke="white"
            strokeWidth={this.state.hoveredOverMinus ? 3 : 0}
          ></Circle>
          <Text
            x={5}
            y={25}
            width={50}
            height={50}
            fontSize={this.state.hoveredOverMinus ? 40 : 36}
            text={`-`}
            align={"center"}
            verticalAlign={"middle"}
          ></Text>
        </Group>
        <Group
          width={40}
          onClick={this.handleIncrement}
          onTap={this.handleIncrement}
          onMouseEnter={this.handleMouseEnterPlusButton}
          onMouseLeave={this.handleMouseLeavePlusButton}
          offsetY={hasText ? 10 : 0}
        >
          <Circle
            width={40}
            height={40}
            fill={this.state.hoveredOverPlus ? "white" : "#e0e0e0"}
            align={"center"}
            verticalAlign={"middle"}
            x={170}
            y={50}
            stroke="white"
            strokeWidth={this.state.hoveredOverPlus ? 3 : 0}
          ></Circle>
          <Text
            x={145}
            y={28}
            width={50}
            height={50}
            fontSize={this.state.hoveredOverPlus ? 40 : 36}
            text={`+`}
            align={"center"}
            verticalAlign={"middle"}
            fill={this.state.hoveredOverPlus ? "black" : "#333"}
          ></Text>
        </Group>

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
            fill={this.state.hoveredOverOptions ? "#333" : "black"}
            align={"center"}
            verticalAlign={"middle"}
            offsetY={-15}
            offsetX={-10}
          ></Circle>
          <Text
            width={30}
            height={30}
            fontSize={24}
            fill={this.state.hoveredOverOptions ? "white" : "#999"}
            text={"..."}
            align={"center"}
            verticalAlign={"middle"}
            offsetY={5}
            offsetX={5}
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

  private handleMouseEnterPlusButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverPlus: true });
    window.document.body.style.cursor = "pointer";
  };

  private handleMouseLeavePlusButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverPlus: false });
    window.document.body.style.cursor = "grab";
  };

  private handleMouseEnterMinusButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverMinus: true });
    window.document.body.style.cursor = "pointer";
  };

  private handleMouseLeaveMinusButton = (
    _event: KonvaEventObject<MouseEvent>
  ) => {
    this.setState({ hoveredOverMinus: false });
    window.document.body.style.cursor = "grab";
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
