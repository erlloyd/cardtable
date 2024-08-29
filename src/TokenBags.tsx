import { Vector2d } from "konva/lib/types";
import TokenBag from "./TokenBag";
import { ITokenBag } from "./features/token-bags/initialState";
import { TokenBagMenuInfo } from "./features/game/initialState";

interface IProps {
  bags: ITokenBag[];
  setTokenBagPosition: (payload: { x: number; y: number; id: string }) => void;
  setTokenBagMenuPosition: (payload: TokenBagMenuInfo) => void;
}

const TokenBags = (props: IProps) =>
  props.bags.map((b) => (
    <TokenBag key={`bag-${b.id}`} bag={b} {...props}></TokenBag>
  ));

export default TokenBags;
