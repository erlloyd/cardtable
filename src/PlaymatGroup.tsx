import { Vector2d } from "konva/lib/types";
import { useCallback, useState } from "react";
import Playmat from "./Playmat";
import { defaultPlaymatHeight } from "./constants/app-constants";
interface IProps {
  imgUrls: string[];
  startingPos: Vector2d;
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

  props.imgUrls.forEach((url, index) => {
    // For now, only do a column

    playmats.push(
      <Playmat
        key={`playmat-index-${index}`}
        id={`${index}`}
        imgUrl={url}
        pos={{ x: props.startingPos.x, y: currentYPos }}
        playmatImageLoaded={handlePlaymatLoaded}
      />
    );

    currentYPos +=
      (playmatDimensions[`${index}`]?.height || defaultPlaymatHeight) + 30;
  });

  return playmats;
};

export default PlaymatGroup;
