import { Component } from "react";
import { ICardStack } from "./features/cards/initialState";
import { Rect, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
import { GameType } from "./game-modules/GameType";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import { TokensInfo } from "./game-modules/GameModule";
import GameManager from "./game-modules/GameModuleManager";
import { ICardData } from "./features/cards-data/initialState";
import { getCardType } from "./utilities/card-utils";
interface IProps {
  currentGameType: GameType;
  x: number;
  y: number;
  card: ICardStack;
  cardData: ICardData;
}

interface IState {
  imagesLoaded: {
    damage: boolean;
    threat: boolean;
    generic: boolean;
    acceleration: boolean;
  };
}

const desiredWidth = 47;
const desiredHeight = 47;

class CardTokens extends Component<IProps, IState> {
  static whyDidYouRender = false;
  private damageImg: HTMLImageElement;
  private threatImg: HTMLImageElement;
  private genericImg: HTMLImageElement;
  private accelerationImg: HTMLImageElement;
  private unmounted: boolean;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      imagesLoaded: {
        damage: false,
        threat: false,
        generic: false,
        acceleration: false,
      },
    };

    this.damageImg = new Image();
    this.threatImg = new Image();
    this.genericImg = new Image();
    this.accelerationImg = new Image();

    const tokenInfo = this.getCorrectTokenInfoHelper(
      this.props.currentGameType,
      getCardType(this.props.card, this.props.cardData),
      this.props.card
    );

    // DAMAGE
    this.damageImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imagesLoaded: {
            damage: true,
            threat: this.state.imagesLoaded.threat,
            generic: this.state.imagesLoaded.generic,
            acceleration: this.state.imagesLoaded.acceleration,
          },
        });
      }
    };

    if (!!this.props.card?.counterTokens.damage && !!tokenInfo.damage) {
      this.damageImg.src = tokenInfo.damage.imagePath;
    }

    // THREAT
    this.threatImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imagesLoaded: {
            damage: this.state.imagesLoaded.damage,
            threat: true,
            generic: this.state.imagesLoaded.generic,
            acceleration: this.state.imagesLoaded.acceleration,
          },
        });
      }
    };

    if (!!this.props.card?.counterTokens.threat && !!tokenInfo.threat) {
      this.threatImg.src = tokenInfo.threat.imagePath;
    }

    // GENERIC
    this.genericImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imagesLoaded: {
            damage: this.state.imagesLoaded.damage,
            threat: this.state.imagesLoaded.threat,
            generic: true,
            acceleration: this.state.imagesLoaded.acceleration,
          },
        });
      }
    };

    if (!!this.props.card?.counterTokens.generic && !!tokenInfo.generic) {
      this.genericImg.src = tokenInfo.generic.imagePath;
    }

    // ACCELERATION
    this.accelerationImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imagesLoaded: {
            damage: this.state.imagesLoaded.damage,
            threat: this.state.imagesLoaded.threat,
            generic: this.state.imagesLoaded.generic,
            acceleration: true,
          },
        });
      }
    };

    if (
      !!this.props.card?.counterTokens.acceleration &&
      !!tokenInfo.acceleration
    ) {
      this.accelerationImg.src = tokenInfo.acceleration.imagePath;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    console.log("COMPONENT DID UPDATE", this.props.cardData);
    const tokenInfo = this.getCorrectTokenInfoHelper(
      this.props.currentGameType,
      getCardType(this.props.card, this.props.cardData),
      this.props.card
    );

    // DAMAGE
    if (
      (!this.state.imagesLoaded.damage &&
        !prevProps.card?.counterTokens.damage &&
        !!this.props.card?.counterTokens.damage &&
        !!tokenInfo.damage) ||
      (!!tokenInfo.damage && this.damageImg.src !== tokenInfo.damage?.imagePath)
    ) {
      this.damageImg.src = tokenInfo.damage.imagePath;
    }

    // THREAT
    if (
      !this.state.imagesLoaded.threat &&
      !prevProps.card?.counterTokens.threat &&
      !!this.props.card?.counterTokens.threat &&
      !!tokenInfo.threat
    ) {
      this.threatImg.src = tokenInfo.threat.imagePath;
    }

    // GENERIC
    if (
      !this.state.imagesLoaded.generic &&
      !prevProps.card?.counterTokens.generic &&
      !!this.props.card?.counterTokens.generic &&
      !!tokenInfo.generic
    ) {
      this.genericImg.src = tokenInfo.generic.imagePath;
    }

    // ACCELERATION
    if (
      !this.state.imagesLoaded.acceleration &&
      !prevProps.card?.counterTokens.acceleration &&
      !!this.props.card?.counterTokens.acceleration &&
      !!tokenInfo.acceleration
    ) {
      this.accelerationImg.src = tokenInfo.acceleration.imagePath;
    }
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    if (!this.props.card) return null;

    const tokenInfo = this.getCorrectTokenInfoHelper(
      this.props.currentGameType,
      getCardType(this.props.card, this.props.cardData),
      this.props.card
    );

    const damageTokenInfo = tokenInfo.damage;

    const generalX = cardConstants[this.props.card.sizeType].CARD_WIDTH / 2;

    const damageX = damageTokenInfo?.overridePosition?.x ?? generalX;
    const damageY =
      damageTokenInfo?.overridePosition?.y ?? desiredHeight / 2 + 20;
    this.props.y - cardConstants[this.props.card.sizeType].CARD_HEIGHT / 2 + 20;
    const showDamage =
      this.state.imagesLoaded.damage && !!this.props.card.counterTokens.damage;

    const damageToken = showDamage ? (
      <Rect
        key={`${this.props.card.id}-damageToken`}
        x={damageX}
        y={damageY}
        offsetX={this.damageImg.naturalWidth / 2}
        offsetY={this.damageImg.naturalHeight / 2}
        scale={{
          x: desiredWidth / this.damageImg.naturalWidth,
          y: desiredHeight / this.damageImg.naturalHeight,
        }}
        width={this.damageImg.naturalWidth}
        height={this.damageImg.naturalHeight}
        fillPatternImage={this.damageImg}
        rotation={this.props.card.exhausted ? -90 : 0}
      ></Rect>
    ) : null;

    const damageSingleOnly = !!tokenInfo.damage?.singleOnly;

    const damageText =
      showDamage && !damageSingleOnly ? (
        <Text
          key={`${this.props.card.id}-damageText`}
          x={damageX}
          y={damageY}
          offsetX={desiredWidth / 2}
          offsetY={desiredHeight / 2}
          width={
            this.damageImg.naturalWidth *
            (desiredWidth / this.damageImg.naturalWidth)
          }
          height={
            this.damageImg.naturalHeight *
            (desiredHeight / this.damageImg.naturalHeight)
          }
          text={`${this.props.card.counterTokens.damage}`}
          fill="white"
          stroke={"black"}
          strokeWidth={1}
          shadowColor="black"
          shadowBlur={10}
          align="center"
          verticalAlign="middle"
          fontSize={24}
          fontStyle="bold"
          rotation={this.props.card.exhausted ? -90 : 0}
        ></Text>
      ) : null;

    const threatTokenInfo = tokenInfo.threat;

    const threatX = threatTokenInfo?.overridePosition?.x ?? generalX;
    const threatY =
      threatTokenInfo?.overridePosition?.y ??
      damageY + (showDamage ? desiredHeight + 5 : 0);
    const showThreat =
      this.state.imagesLoaded.threat && !!this.props.card.counterTokens.threat;

    const threatToken = showThreat ? (
      <Rect
        key={`${this.props.card.id}-threatToken`}
        x={threatX}
        y={threatY}
        offsetX={this.threatImg.naturalWidth / 2}
        offsetY={this.threatImg.naturalHeight / 2}
        scale={{
          x: desiredWidth / this.threatImg.naturalWidth,
          y: desiredHeight / this.threatImg.naturalHeight,
        }}
        width={this.threatImg.naturalWidth}
        height={this.threatImg.naturalHeight}
        fillPatternImage={this.threatImg}
        rotation={this.props.card.exhausted ? -90 : 0}
      ></Rect>
    ) : null;

    const threatSingleOnly = !!tokenInfo.threat?.singleOnly;

    const threatText =
      showThreat && !threatSingleOnly ? (
        <Text
          key={`${this.props.card.id}-threatText`}
          x={threatX}
          y={threatY}
          offsetX={desiredWidth / 2}
          offsetY={desiredHeight / 2}
          width={
            this.threatImg.naturalWidth *
            (desiredWidth / this.threatImg.naturalWidth)
          }
          height={
            this.threatImg.naturalHeight *
            (desiredHeight / this.threatImg.naturalHeight)
          }
          text={`${this.props.card.counterTokens.threat}`}
          fill="white"
          stroke={"black"}
          strokeWidth={1}
          shadowColor="black"
          shadowBlur={10}
          align="center"
          verticalAlign="middle"
          fontSize={24}
          fontStyle="bold"
          rotation={this.props.card.exhausted ? -90 : 0}
        ></Text>
      ) : null;

    const genericTokenInfo = tokenInfo.generic;

    const genericX = genericTokenInfo?.overridePosition?.x ?? generalX;
    const genericY =
      genericTokenInfo?.overridePosition?.y ??
      damageY +
        (showDamage ? desiredHeight + 5 : 0) +
        (showThreat ? desiredHeight + 5 : 0);
    const showGeneric =
      this.state.imagesLoaded.generic &&
      !!this.props.card.counterTokens.generic;

    const genericToken = showGeneric ? (
      <Rect
        key={`${this.props.card.id}-genericToken`}
        x={genericX}
        y={genericY}
        offsetX={this.genericImg.naturalWidth / 2}
        offsetY={this.genericImg.naturalHeight / 2}
        scale={{
          x: desiredWidth / this.genericImg.naturalWidth,
          y: desiredHeight / this.genericImg.naturalHeight,
        }}
        width={this.genericImg.naturalWidth}
        height={this.genericImg.naturalHeight}
        fillPatternImage={this.genericImg}
        rotation={this.props.card.exhausted ? -90 : 0}
      ></Rect>
    ) : null;

    const genericSingleOnly = !!tokenInfo.generic?.singleOnly;

    const genericText =
      showGeneric && !genericSingleOnly ? (
        <Text
          key={`${this.props.card.id}-genericText`}
          x={genericX}
          y={genericY}
          offsetX={desiredWidth / 2}
          offsetY={desiredHeight / 2}
          width={
            this.genericImg.naturalWidth *
            (desiredWidth / this.genericImg.naturalWidth)
          }
          height={
            this.genericImg.naturalHeight *
            (desiredHeight / this.genericImg.naturalHeight)
          }
          text={`${this.props.card.counterTokens.generic}`}
          fill="white"
          stroke={"black"}
          strokeWidth={1}
          shadowColor="black"
          shadowBlur={10}
          align="center"
          verticalAlign="middle"
          fontSize={24}
          fontStyle="bold"
          rotation={this.props.card.exhausted ? -90 : 0}
        ></Text>
      ) : null;

    const accelTokenInfo = tokenInfo.acceleration;

    const accelX = accelTokenInfo?.overridePosition?.x ?? generalX;
    const accelY =
      accelTokenInfo?.overridePosition?.y ??
      damageY +
        (showDamage ? desiredHeight + 5 : 0) +
        (showThreat ? desiredHeight + 5 : 0) +
        (showGeneric ? desiredHeight + 5 : 0);
    const showAccel =
      this.state.imagesLoaded.acceleration &&
      !!this.props.card.counterTokens.acceleration;

    const accelToken = showAccel ? (
      <Rect
        key={`${this.props.card.id}-accelToken`}
        x={accelX}
        y={accelY}
        offsetX={this.accelerationImg.naturalWidth / 2}
        offsetY={this.accelerationImg.naturalHeight / 2}
        scale={{
          x: desiredWidth / this.accelerationImg.naturalWidth,
          y: desiredHeight / this.accelerationImg.naturalHeight,
        }}
        width={this.accelerationImg.naturalWidth}
        height={this.accelerationImg.naturalHeight}
        fillPatternImage={this.accelerationImg}
        rotation={this.props.card.exhausted ? -90 : 0}
      ></Rect>
    ) : null;

    const accelSingleOnly = !!tokenInfo.acceleration?.singleOnly;

    const accelText =
      showAccel && !accelSingleOnly ? (
        <Text
          key={`${this.props.card.id}-accelText`}
          x={accelX}
          y={accelY}
          offsetX={desiredWidth / 2}
          offsetY={desiredHeight / 2}
          width={
            this.accelerationImg.naturalWidth *
            (desiredWidth / this.accelerationImg.naturalWidth)
          }
          height={
            this.accelerationImg.naturalHeight *
            (desiredHeight / this.accelerationImg.naturalHeight)
          }
          text={`${this.props.card.counterTokens.acceleration}`}
          fill="white"
          stroke={"black"}
          strokeWidth={1}
          shadowColor="black"
          shadowBlur={10}
          align="center"
          verticalAlign="middle"
          fontSize={24}
          fontStyle="bold"
          rotation={this.props.card.exhausted ? -90 : 0}
        ></Text>
      ) : null;

    return [
      damageToken,
      damageText,
      threatToken,
      threatText,
      genericToken,
      genericText,
      accelToken,
      accelText,
    ];
  }

  private getCorrectTokenInfoHelper(
    currentGameType: GameType,
    cardType: string,
    card?: ICardStack
  ): TokensInfo {
    let hasCustom;
    if (
      !!GameManager.getModuleForType(currentGameType).getCustomTokenInfoForCard
    ) {
      hasCustom = !!card
        ? GameManager.getModuleForType(currentGameType)
            .getCustomTokenInfoForCard!!(
            card,
            cardType,
            GameManager.getModuleForType(this.props.currentGameType).properties
              .tokens
          )
        : null;
    }

    return hasCustom ?? GamePropertiesMap[currentGameType].tokens;
  }
}

export default CardTokens;
