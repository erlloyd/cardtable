export type CardPack = CardData[];

export interface CardData {
  attack?: number | string | null;
  back_link?: string;
  code: string;
  deck_limit?: number;
  defense?: number;
  double_sided?: boolean;
  faction_code: string;
  flavor?: string;
  hand_size?: number;
  health?: number;
  is_unique?: boolean;
  name: string;
  octgn_id?: string;
  pack_code: string;
  position: number;
  quantity: number;
  set_code?: string;
  text?: string;
  thwart?: number | null;
  traits?: string;
  type_code: string;
  duplicate_of?: string;
}
