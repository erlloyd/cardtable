import { Vector2d } from "konva/lib/types";
import { useCallback, useState } from "react";
import Playmat from "./Playmat";
import {
  defaultPlaymatHeight,
  defaultPlaymatWidth,
} from "./constants/app-constants";
import { IPlaymatLayout } from "./game-modules/GameModule";
interface IProps {
  imgUrls: string[];
  startingPos: Vector2d;
  defaultLayoutDirection: IPlaymatLayout;
  customWidth?: number;
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
  let overrideFirstXPos: number | undefined;
  //The 0th one needs to be in the first row, and either normal spot if only 1 other playmat,
  // or shifted over by half if 2+ playmats
  const multiplePlayerPlaymats = props.imgUrls.length > 2;

  if (props.defaultLayoutDirection === "ebr" && multiplePlayerPlaymats) {
    overrideFirstXPos =
      currentXPos +
      ((playmatDimensions[0]?.width || defaultPlaymatWidth) + 30) / 2;
  }

  props.imgUrls.forEach((url, index) => {
    // For now, only do one direction

    console.log(`Playmat index ${index}`);

    playmats.push(
      <Playmat
        key={`playmat-index-${index}`}
        id={`${index}`}
        imgUrl={url}
        pos={{ x: overrideFirstXPos ?? currentXPos, y: currentYPos }}
        playmatImageLoaded={handlePlaymatLoaded}
        customWidth={props.customWidth}
      />
    );

    overrideFirstXPos = undefined;

    if (props.defaultLayoutDirection === "column") {
      currentYPos +=
        (playmatDimensions[`${index}`]?.height || defaultPlaymatHeight) + 30;
    } else if (props.defaultLayoutDirection === "row") {
      currentXPos +=
        (playmatDimensions[`${index}`]?.width || defaultPlaymatWidth) + 30;
    } else if (props.defaultLayoutDirection === "ebr") {
      if (index === 0) {
        console.log("index is 0");
        currentYPos +=
          (playmatDimensions[`${index}`]?.height || defaultPlaymatHeight) + 30;
      }

      if (index !== 0 && index % 2 === 0) {
        console.log("index is even");
        currentXPos = props.startingPos.x;
        currentYPos +=
          (playmatDimensions[`${index}`]?.height || defaultPlaymatHeight) + 30;
      } else if (index % 2 === 1) {
        currentXPos +=
          (playmatDimensions[`${index}`]?.width || defaultPlaymatWidth) + 30;
        console.log("index is odd");
      }
    }
  });

  return playmats;
};

// PlaymatGroup.whyDidYouRender = true;

export default PlaymatGroup;
