import { Image } from "react-konva";
import { ITokenBag } from "./features/token-bags/initialState";
import useImage from "use-image";

interface IProps {
  bag: ITokenBag;
}

const TokenBag = (props: IProps) => {
  const [image, status] = useImage(props.bag.bagImgUrl);

  return status === "loaded" ? (
    <Image x={props.bag.position.x} y={props.bag.position.y} image={image} />
  ) : null;
};

export default TokenBag;
