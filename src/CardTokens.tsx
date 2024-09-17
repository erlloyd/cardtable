import { Component } from "react";
import { ICardStack } from "./features/cards/initialState";
import { Rect, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
import { GameType } from "./game-modules/GameType";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { CounterTokenInfo, TokensInfo } from "./game-modules/GameModule";
import GameManager from "./game-modules/GameModuleManager";
import { ICardData } from "./features/cards-data/initialState";
import { getCardType } from "./utilities/card-utils";
import useImage from "use-image";
interface IProps {
  currentGameType: GameType;
  x: number;
  y: number;
  card: ICardStack;
  cardData: ICardData;
}

const desiredWidth = 47;
const desiredHeight = 47;

const getCorrectTokenInfoHelper = (
  currentGameType: GameType,
  cardType: string,
  card?: ICardStack
): CounterTokenInfo[] => {
  let hasCustom;
  if (
    !!GameManager.getModuleForType(currentGameType).getCustomTokenInfoForCard
  ) {
    hasCustom = !!card
      ? GameManager.getModuleForType(currentGameType)
          .getCustomTokenInfoForCard!!(
          card,
          cardType,
          GameManager.getModuleForType(currentGameType).properties.counterTokens
        )
      : null;
  }

  return hasCustom ?? GamePropertiesMap[currentGameType].counterTokens;
  // return GamePropertiesMap[currentGameType].counterTokens;
};

const CardTokens = (props: IProps) => {
  if (!props.card) return null;

  const tokenInfo = getCorrectTokenInfoHelper(
    props.currentGameType,
    getCardType(props.card, props.cardData),
    props.card
  );

  // const damageTokenInfo = tokenInfo.damage;
  // const threatTokenInfo = tokenInfo.threat;
  // const genericTokenInfo = tokenInfo.generic;
  // const accelTokenInfo = tokenInfo.acceleration;

  const imagesWithStatus: {
    img: HTMLImageElement | undefined;
    status: "loaded" | "loading" | "failed";
  }[] = [];

  //load all the images
  tokenInfo.forEach((ti) => {
    let [img, status] = useImage(ti.imagePath);
    imagesWithStatus.push({ img, status });
  });

  const generalX = cardConstants[props.card.sizeType].CARD_WIDTH / 2;

  const renderList: (JSX.Element | null)[] = [];
  let lastY = desiredHeight / 2 + 15;
  imagesWithStatus.forEach((imgWithStatus, index) => {
    const thisTokenInfo = tokenInfo[index];
    const cardTokenInfo = props.card.counterTokensList.find(
      (ct) => ct.type === thisTokenInfo.type
    );
    if (!cardTokenInfo) {
      // console.error(`Couldn't find token info for type ${thisTokenInfo.type}`);
      return;
    }

    const tokenX = thisTokenInfo.overridePosition?.x ?? generalX;
    const tokenY = thisTokenInfo.overridePosition?.y ?? lastY + 5;

    const showToken =
      !!cardTokenInfo &&
      !!cardTokenInfo.count &&
      imgWithStatus.status === "loaded" &&
      !!imgWithStatus.img;

    const token = showToken ? (
      <Rect
        key={`${props.card.id}-${thisTokenInfo.type}Token`}
        x={tokenX}
        y={tokenY}
        offsetX={imgWithStatus.img!.naturalWidth / 2}
        offsetY={imgWithStatus.img!.naturalHeight / 2}
        scale={{
          x: desiredWidth / imgWithStatus.img!.naturalWidth,
          y: desiredHeight / imgWithStatus.img!.naturalHeight,
        }}
        width={imgWithStatus.img!.naturalWidth}
        height={imgWithStatus.img!.naturalHeight}
        fillPatternImage={imgWithStatus.img!}
        rotation={props.card.exhausted ? -90 : 0}
      ></Rect>
    ) : null;

    const tokenSingleOnly = !!thisTokenInfo.singleOnly;

    const tokenText =
      showToken && !tokenSingleOnly ? (
        <Text
          key={`${props.card.id}-${thisTokenInfo.type}Text`}
          x={tokenX}
          y={tokenY}
          offsetX={desiredWidth / 2}
          offsetY={desiredHeight / 2}
          width={
            imgWithStatus.img!.naturalWidth *
            (desiredWidth / imgWithStatus.img!.naturalWidth)
          }
          height={
            imgWithStatus.img!.naturalHeight *
            (desiredHeight / imgWithStatus.img!.naturalHeight)
          }
          text={`${cardTokenInfo.count}`}
          fill="white"
          stroke={"black"}
          strokeWidth={5}
          fillAfterStrokeEnabled={true}
          // I wish I could just blur but iOS devices have horrible performance with them
          // shadowColor="black"
          // shadowBlur={10}
          align="center"
          verticalAlign="middle"
          fontSize={24}
          fontStyle="bold"
          rotation={props.card.exhausted ? -90 : 0}
        ></Text>
      ) : null;
    renderList.push(token);
    renderList.push(tokenText);

    if (showToken) {
      lastY = desiredHeight + tokenY;
    }
  });

  return renderList;

  // const damageX = damageTokenInfo?.overridePosition?.x ?? generalX;
  // const damageY =
  //   damageTokenInfo?.overridePosition?.y ?? desiredHeight / 2 + 20;
  // props.y - cardConstants[props.card.sizeType].CARD_HEIGHT / 2 + 20;
  // const showDamage =
  //   !!props.card.counterTokens.damage &&
  //   damageImgStatus === "loaded" &&
  //   !!damageImg;

  // const damageToken = showDamage ? (
  //   <Rect
  //     key={`${props.card.id}-damageToken`}
  //     x={damageX}
  //     y={damageY}
  //     offsetX={damageImg.naturalWidth / 2}
  //     offsetY={damageImg.naturalHeight / 2}
  //     scale={{
  //       x: desiredWidth / damageImg.naturalWidth,
  //       y: desiredHeight / damageImg.naturalHeight,
  //     }}
  //     width={damageImg.naturalWidth}
  //     height={damageImg.naturalHeight}
  //     fillPatternImage={damageImg}
  //     rotation={props.card.exhausted ? -90 : 0}
  //   ></Rect>
  // ) : null;

  // const damageSingleOnly = !!tokenInfo.damage?.singleOnly;

  // const damageText =
  //   showDamage && !damageSingleOnly ? (
  //     <Text
  //       key={`${props.card.id}-damageText`}
  //       x={damageX}
  //       y={damageY}
  //       offsetX={desiredWidth / 2}
  //       offsetY={desiredHeight / 2}
  //       width={damageImg.naturalWidth * (desiredWidth / damageImg.naturalWidth)}
  //       height={
  //         damageImg.naturalHeight * (desiredHeight / damageImg.naturalHeight)
  //       }
  //       text={`${props.card.counterTokens.damage}`}
  //       fill="white"
  //       stroke={"black"}
  //       strokeWidth={5}
  //       fillAfterStrokeEnabled={true}
  //       // I wish I could just blur but iOS devices have horrible performance with them
  //       // shadowColor="black"
  //       // shadowBlur={10}
  //       align="center"
  //       verticalAlign="middle"
  //       fontSize={24}
  //       fontStyle="bold"
  //       rotation={props.card.exhausted ? -90 : 0}
  //     ></Text>
  //   ) : null;

  // const threatX = threatTokenInfo?.overridePosition?.x ?? generalX;
  // const threatY =
  //   threatTokenInfo?.overridePosition?.y ??
  //   damageY + (showDamage ? desiredHeight + 5 : 0);

  // const showThreat =
  //   !!props.card.counterTokens.threat &&
  //   threatImgStatus === "loaded" &&
  //   !!threatImg;

  // const threatToken = showThreat ? (
  //   <Rect
  //     key={`${props.card.id}-threatToken`}
  //     x={threatX}
  //     y={threatY}
  //     offsetX={threatImg.naturalWidth / 2}
  //     offsetY={threatImg.naturalHeight / 2}
  //     scale={{
  //       x: desiredWidth / threatImg.naturalWidth,
  //       y: desiredHeight / threatImg.naturalHeight,
  //     }}
  //     width={threatImg.naturalWidth}
  //     height={threatImg.naturalHeight}
  //     fillPatternImage={threatImg}
  //     rotation={props.card.exhausted ? -90 : 0}
  //   ></Rect>
  // ) : null;

  // const threatSingleOnly = !!tokenInfo.threat?.singleOnly;

  // const threatText =
  //   showThreat && !threatSingleOnly ? (
  //     <Text
  //       key={`${props.card.id}-threatText`}
  //       x={threatX}
  //       y={threatY}
  //       offsetX={desiredWidth / 2}
  //       offsetY={desiredHeight / 2}
  //       width={threatImg.naturalWidth * (desiredWidth / threatImg.naturalWidth)}
  //       height={
  //         threatImg.naturalHeight * (desiredHeight / threatImg.naturalHeight)
  //       }
  //       text={`${props.card.counterTokens.threat}`}
  //       fill="white"
  //       stroke={"black"}
  //       strokeWidth={5}
  //       fillAfterStrokeEnabled={true}
  //       // I wish I could just blur but iOS devices have horrible performance with them
  //       // shadowColor="black"
  //       // shadowBlur={10}
  //       align="center"
  //       verticalAlign="middle"
  //       fontSize={24}
  //       fontStyle="bold"
  //       rotation={props.card.exhausted ? -90 : 0}
  //     ></Text>
  //   ) : null;

  // const genericX = genericTokenInfo?.overridePosition?.x ?? generalX;
  // const genericY =
  //   genericTokenInfo?.overridePosition?.y ??
  //   damageY +
  //     (showDamage ? desiredHeight + 5 : 0) +
  //     (showThreat ? desiredHeight + 5 : 0);
  // const showGeneric =
  //   !!props.card.counterTokens.generic &&
  //   genericImgStatus === "loaded" &&
  //   !!genericImg;

  // const genericToken = showGeneric ? (
  //   <Rect
  //     key={`${props.card.id}-genericToken`}
  //     x={genericX}
  //     y={genericY}
  //     offsetX={genericImg.naturalWidth / 2}
  //     offsetY={genericImg.naturalHeight / 2}
  //     scale={{
  //       x: desiredWidth / genericImg.naturalWidth,
  //       y: desiredHeight / genericImg.naturalHeight,
  //     }}
  //     width={genericImg.naturalWidth}
  //     height={genericImg.naturalHeight}
  //     fillPatternImage={genericImg}
  //     rotation={props.card.exhausted ? -90 : 0}
  //   ></Rect>
  // ) : null;

  // const genericSingleOnly = !!tokenInfo.generic?.singleOnly;

  // const genericText =
  //   showGeneric && !genericSingleOnly ? (
  //     <Text
  //       key={`${props.card.id}-genericText`}
  //       x={genericX}
  //       y={genericY}
  //       offsetX={desiredWidth / 2}
  //       offsetY={desiredHeight / 2}
  //       width={
  //         genericImg.naturalWidth * (desiredWidth / genericImg.naturalWidth)
  //       }
  //       height={
  //         genericImg.naturalHeight * (desiredHeight / genericImg.naturalHeight)
  //       }
  //       text={`${props.card.counterTokens.generic}`}
  //       fill="white"
  //       stroke={"black"}
  //       strokeWidth={5}
  //       fillAfterStrokeEnabled={true}
  //       // I wish I could just blur but iOS devices have horrible performance with them
  //       // shadowColor="black"
  //       // shadowBlur={10}
  //       align="center"
  //       verticalAlign="middle"
  //       fontSize={24}
  //       fontStyle="bold"
  //       rotation={props.card.exhausted ? -90 : 0}
  //     ></Text>
  //   ) : null;

  // const accelX = accelTokenInfo?.overridePosition?.x ?? generalX;
  // const accelY =
  //   accelTokenInfo?.overridePosition?.y ??
  //   damageY +
  //     (showDamage ? desiredHeight + 5 : 0) +
  //     (showThreat ? desiredHeight + 5 : 0) +
  //     (showGeneric ? desiredHeight + 5 : 0);

  // const showAccel =
  //   !!props.card.counterTokens.acceleration &&
  //   accelImgStatus === "loaded" &&
  //   !!accelImg;

  // const accelToken = showAccel ? (
  //   <Rect
  //     key={`${props.card.id}-accelToken`}
  //     x={accelX}
  //     y={accelY}
  //     offsetX={accelImg.naturalWidth / 2}
  //     offsetY={accelImg.naturalHeight / 2}
  //     scale={{
  //       x: desiredWidth / accelImg.naturalWidth,
  //       y: desiredHeight / accelImg.naturalHeight,
  //     }}
  //     width={accelImg.naturalWidth}
  //     height={accelImg.naturalHeight}
  //     fillPatternImage={accelImg}
  //     rotation={props.card.exhausted ? -90 : 0}
  //   ></Rect>
  // ) : null;

  // const accelSingleOnly = !!tokenInfo.acceleration?.singleOnly;

  // const accelText =
  //   showAccel && !accelSingleOnly ? (
  //     <Text
  //       key={`${props.card.id}-accelText`}
  //       x={accelX}
  //       y={accelY}
  //       offsetX={desiredWidth / 2}
  //       offsetY={desiredHeight / 2}
  //       width={accelImg.naturalWidth * (desiredWidth / accelImg.naturalWidth)}
  //       height={
  //         accelImg.naturalHeight * (desiredHeight / accelImg.naturalHeight)
  //       }
  //       text={`${props.card.counterTokens.acceleration}`}
  //       fill="white"
  //       stroke={"black"}
  //       strokeWidth={5}
  //       fillAfterStrokeEnabled={true}
  //       // I wish I could just blur but iOS devices have horrible performance with them
  //       // shadowColor="black"
  //       // shadowBlur={10}
  //       align="center"
  //       verticalAlign="middle"
  //       fontSize={24}
  //       fontStyle="bold"
  //       rotation={props.card.exhausted ? -90 : 0}
  //     ></Text>
  //   ) : null;

  // return [
  //   damageToken,
  //   damageText,
  //   threatToken,
  //   threatText,
  //   genericToken,
  //   genericText,
  //   accelToken,
  //   accelText,
  // ];
};

export default CardTokens;
