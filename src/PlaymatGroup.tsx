import { Vector2d } from "konva/lib/types";
import { useCallback, useState } from "react";
import Playmat from "./Playmat";
import {
  defaultPlaymatHeight,
  defaultPlaymatWidth,
} from "./constants/app-constants";
interface IProps {
  imgUrls: string[];
  startingPos: Vector2d;
  defaultLayoutDirection: "row" | "column";
}

const PlaymatGroup = (props: IProps) => {
  const [playmatDimensions, setPlaymatDimensions] = useState(
    {} as { [key: string]: { width: number; height: number } }
  );
  const handlePlaymatLoaded = useCallback(
    (id: string, playmatWidth: number, playmatHeight: number) => {
      playmatDimensions[id] = { width: playmatWidth, height: playmatHeight };
      setPlaymatDimensions(playmatDimensions);
    },
    [setPlaymatDimensions, playmatDimensions]
  );

  // Build up the playmat list
  const playmats: JSX.Element[] = [];
  let currentYPos = props.startingPos.y;
  let currentXPos = props.startingPos.x;

  props.imgUrls.forEach((url, index) => {
    // For now, only do one direction

    playmats.push(
      <Playmat
        key={`playmat-index-${index}`}
        id={`${index}`}
        imgUrl={url}
        pos={{ x: currentXPos, y: currentYPos }}
        playmatImageLoaded={handlePlaymatLoaded}
      />
    );

    if (props.defaultLayoutDirection === "column") {
      currentYPos +=
        (playmatDimensions[`${index}`]?.height || defaultPlaymatHeight) + 30;
    } else if (props.defaultLayoutDirection === "row") {
      currentXPos +=
        (playmatDimensions[`${index}`]?.width || defaultPlaymatWidth) + 30;
    }
  });

  return playmats;
};

export default PlaymatGroup;
