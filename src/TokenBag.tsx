import { Image } from "react-konva";
import useImage from "use-image";
import { ITokenBag } from "./features/token-bags/initialState";
import { Vector2d } from "konva/lib/types";
import { Stage } from "konva/lib/Stage";
import { TokenBagMenuInfo } from "./features/game/initialState";

interface IProps {
  bag: ITokenBag;
  setTokenBagPosition: (payload: { x: number; y: number; id: string }) => void;
  setTokenBagMenuPosition: (payload: TokenBagMenuInfo) => void;
}

const TokenBag = (props: IProps) => {
  const [image, status] = useImage(props.bag.bagImgUrl);

  return status === "loaded" ? (
    <Image
      onClick={(e) => {
        const newPos = { x: e.evt.x, y: e.evt.y };
        console.log(newPos);
        props.setTokenBagMenuPosition({
          position: newPos,
          bagId: props.bag.id,
        });
      }}
      onTap={(e) => {
        // keep going until we get to stage
        let target = e.currentTarget;
        while (target.parent !== null) {
          target = target.parent;
        }
        const newPos = (target as Stage).pointerPos ?? { x: 100, y: 100 };

        console.log(e.currentTarget);
        console.log(newPos);
        props.setTokenBagMenuPosition({
          position: newPos,
          bagId: props.bag.id,
        });
      }}
      draggable={true}
      x={props.bag.position.x}
      y={props.bag.position.y}
      image={image}
      onDragEnd={(e) => {
        props.setTokenBagPosition({
          x: e.target.x(),
          y: e.target.y(),
          id: props.bag.id,
        });
      }}
    />
  ) : null;
};

export default TokenBag;
