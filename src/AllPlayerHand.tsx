import TopLayer from "./TopLayer";
import { IPlayerHand } from "./features/cards/initialState";
import "./AllPlayerHand.scss";
import { ICardData } from "./features/cards-data/initialState";
import cx from "classnames";
import {
  getCardTypeWithoutStack,
  getImgUrlsFromJsonId,
  shouldRenderImageHorizontal,
} from "./utilities/card-utils";
import GameManager from "./game-modules/GameModuleManager";
import { GameType } from "./game-modules/GameType";

interface IProps {
  allPlayerHandsData: { numCards: number; role: string | null }[];
  playerHandData: IPlayerHand | null;
  playerNumber: number;
  cardData: ICardData;
  currentGameType: GameType | null;
  toggleShowFullHandUI: () => void;
}

const AllPlayerHand = (props: IProps) => {
  const cards = props.playerHandData?.cards ?? [];

  return (
    <TopLayer
      staticPosition={true}
      trasparentBackground={true}
      offsetContent={false}
      position={{ x: 0, y: 0 }}
      noPadding={true}
      fullHeight={true}
      fullWidth={true}
      completed={props.toggleShowFullHandUI}
    >
      <div className="entire-hand-container">
        {cards.map((card) => {
          const imgUrl =
            getImgUrlsFromJsonId(
              card.cardDetails.jsonId,
              true,
              props.cardData,
              props.currentGameType
            )[0] ?? "missing";

          const cardType = getCardTypeWithoutStack(
            card.cardDetails.jsonId,
            true,
            props.cardData
          );

          let shouldRotate = shouldRenderImageHorizontal(
            card.cardDetails.jsonId,
            cardType,
            GameManager.horizontalCardTypes[
              props.currentGameType ?? GameManager.allRegisteredGameTypes[0]
            ],
            imgUrl.includes("back")
          );

          if (
            !!props.currentGameType &&
            GameManager.getModuleForType(props.currentGameType).shouldRotateCard
          ) {
            shouldRotate = GameManager.getModuleForType(props.currentGameType)
              .shouldRotateCard!(card.cardDetails.jsonId, cardType, true);
          }

          return (
            <img
              key={`full-hand-image-${card.cardDetails.jsonId}`}
              className={cx({
                "full-hand-img": true,
                "rotate-card": shouldRotate,
              })}
              src={imgUrl}
            ></img>
          );
        })}
      </div>
    </TopLayer>
  );
};

export default AllPlayerHand;
