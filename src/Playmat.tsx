import { Vector2d } from "konva/lib/types";
import { useEffect } from "react";
import { Group, Rect } from "react-konva";
import useImage from "use-image";
import {
  defaultPlaymatHeight,
  defaultPlaymatWidth,
} from "./constants/app-constants";
interface IProps {
  id: string;
  imgUrl: string;
  pos: Vector2d;
  customWidth?: number;
  playmatImageLoaded: (
    id: string,
    playmatWidth: number,
    playmatHeight: number
  ) => void;
}

const Playmat = (props: IProps) => {
  const [playmatImg, playmatImgStatus] = useImage(props.imgUrl);

  const isLoaded = playmatImgStatus === "loaded";

  const desiredWidth = props.customWidth ?? 2880;

  const playmatScale =
    isLoaded && !!playmatImg?.naturalWidth
      ? desiredWidth / playmatImg?.naturalWidth
      : 1;

  useEffect(() => {
    if (playmatImgStatus == "loaded") {
      props.playmatImageLoaded(
        props.id,
        (playmatImg?.naturalWidth ?? defaultPlaymatWidth) * playmatScale,
        (playmatImg?.naturalHeight ?? defaultPlaymatHeight) * playmatScale
      );
    }
  }, [playmatImgStatus]);

  return (
    <Group>
      <Rect
        fill={isLoaded ? undefined : "lightgray"}
        scale={{
          x: playmatScale,
          y: playmatScale,
        }}
        x={props.pos.x}
        y={props.pos.y}
        width={isLoaded ? playmatImg?.naturalWidth : defaultPlaymatWidth}
        height={isLoaded ? playmatImg?.naturalHeight : defaultPlaymatHeight}
        fillPatternImage={isLoaded && !!playmatImg ? playmatImg : undefined}
      ></Rect>
    </Group>
  );
};

export default Playmat;
