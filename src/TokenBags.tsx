import TokenBag from "./TokenBag";
import { ITokenBag } from "./features/token-bags/initialState";

interface IProps {
  bags: ITokenBag[];
}

const TokenBags = (props: IProps) =>
  props.bags.map((b) => <TokenBag key={`bag-${b.id}`} bag={b}></TokenBag>);

export default TokenBags;
