import React from "react";
import { Group } from "react-konva";
import Arrow from "./Arrow";
import { IArrow } from "./features/arrows/initialState";
interface IProps {
  arrows?: IArrow[];
}

const CurvedArrows = (props: IProps) => {
  console.log(props.arrows);
  return (
    <Group>
      {props.arrows
        ? props.arrows.map((_arrowData) => (
            <Arrow
              startPoint={{ x: 0, y: 0 }}
              endPoint={{ x: 400, y: 400 }}
            ></Arrow>
          ))
        : null}
    </Group>
  );
};

export default CurvedArrows;
