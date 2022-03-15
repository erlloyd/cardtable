import { Vector2d } from "konva/lib/types";
import { Arrow as KonvaArrow } from "react-konva";
import { getPointsForCurvedArrowFlattened } from "./utilities/geo";
interface IProps {
  startPoint: Vector2d;
  endPoint: Vector2d;
}

const Arrow = (props: IProps) => {
  return (
    <KonvaArrow
      tension={0.5}
      points={getPointsForCurvedArrowFlattened(
        props.startPoint,
        props.endPoint
      )}
      pointerLength={20}
      pointerWidth={20}
      fill={"red"}
      stroke={"red"}
      strokeWidth={40}
      opacity={0.4}
      // bezier={true}
    ></KonvaArrow>
  );
};

export default Arrow;
