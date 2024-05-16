import { Vector2d } from "konva/lib/types";
import TokenBag from "./TokenBag";
import { ITokenBag } from "./features/token-bags/initialState";

interface IProps {
  bags: ITokenBag[];
  setTokenBagPosition: (payload: { x: number; y: number; id: string }) => void;
  setTokenBagMenuPosition: (position: Vector2d | null) => void;
}

const TokenBags = (props: IProps) =>
  props.bags.map((b) => (
    <TokenBag key={`bag-${b.id}`} bag={b} {...props}></TokenBag>
  ));

export default TokenBags;
