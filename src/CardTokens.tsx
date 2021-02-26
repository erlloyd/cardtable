import { Component } from "react";
import * as React from "react";
import { ICardStack } from "./features/cards/initialState";
import { Rect, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
import { GameType } from "./constants/app-constants";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
interface IProps {
  currentGameType: GameType;
  x: number;
  y: number;
  card: ICardStack | undefined;
}

interface IState {
  imagesLoaded: {
    damage: boolean;
    threat: boolean;
    generic: boolean;
  };
}

const desiredWidth = 47;
const desiredHeight = 47;

class CardTokens extends Component<IProps, IState> {
  private damageImg: HTMLImageElement;
  private threatImg: HTMLImageElement;
  private genericImg: HTMLImageElement;
  private unmounted: boolean;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.state = {
      imagesLoaded: {
        damage: false,
        threat: false,
        generic: false,
      },
    };

    this.damageImg = new Image();
    this.threatImg = new Image();
    this.genericImg = new Image();

    const tokenInfo = GamePropertiesMap[this.props.currentGameType].tokens;

    // DAMAGE
    this.damageImg.onload = () => {
      if (!this.unmounted) {
        this.setState({
          imagesLoaded: {
            damage: true,
            threat: this.state.imagesLoaded.threat,
            generic: this.state.imagesLoaded.generic,
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
          },
        });
      }
    };

    if (!!this.props.card?.counterTokens.generic && !!tokenInfo.generic) {
      this.genericImg.src = tokenInfo.generic.imagePath;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    const tokenInfo = GamePropertiesMap[this.props.currentGameType].tokens;

    // DAMAGE
    if (
      !this.state.imagesLoaded.damage &&
      !prevProps.card?.counterTokens.damage &&
      !!this.props.card?.counterTokens.damage &&
      !!tokenInfo.damage
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
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    if (!this.props.card) return null;

    const damageX = this.props.x - desiredWidth / 2;
    const damageY = this.props.y - cardConstants.CARD_HEIGHT / 2 + 20;
    const showDamage =
      this.state.imagesLoaded.damage && !!this.props.card.counterTokens.damage;

    const damageToken = showDamage ? (
      <Rect
        key={`${this.props.card.id}-damageToken`}
        x={damageX}
        y={damageY}
        scale={{
          x: desiredWidth / this.damageImg.naturalWidth,
          y: desiredHeight / this.damageImg.naturalHeight,
        }}
        width={this.damageImg.naturalWidth}
        height={this.damageImg.naturalHeight}
        fillPatternImage={this.damageImg}
      ></Rect>
    ) : null;

    const damageText = showDamage ? (
      <Text
        key={`${this.props.card.id}-damageText`}
        x={damageX}
        y={damageY}
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
        align="center"
        verticalAlign="middle"
        fontSize={24}
      ></Text>
    ) : null;

    const threatX = this.props.x - desiredWidth / 2;
    const threatY = damageY + desiredHeight + 5;
    const showThreat =
      this.state.imagesLoaded.threat && !!this.props.card.counterTokens.threat;

    const threatToken = showThreat ? (
      <Rect
        key={`${this.props.card.id}-threatToken`}
        x={threatX}
        y={threatY}
        scale={{
          x: desiredWidth / this.threatImg.naturalWidth,
          y: desiredHeight / this.threatImg.naturalHeight,
        }}
        width={this.threatImg.naturalWidth}
        height={this.threatImg.naturalHeight}
        fillPatternImage={this.threatImg}
      ></Rect>
    ) : null;

    const threatText = showThreat ? (
      <Text
        key={`${this.props.card.id}-threatText`}
        x={threatX}
        y={threatY}
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
        align="center"
        verticalAlign="middle"
        fontSize={24}
      ></Text>
    ) : null;

    const genericX = this.props.x - desiredWidth / 2;
    const genericY = threatY + desiredHeight + 5;
    const showGeneric =
      this.state.imagesLoaded.generic &&
      !!this.props.card.counterTokens.generic;

    const genericToken = showGeneric ? (
      <Rect
        key={`${this.props.card.id}-genericToken`}
        x={genericX}
        y={genericY}
        scale={{
          x: desiredWidth / this.genericImg.naturalWidth,
          y: desiredHeight / this.genericImg.naturalHeight,
        }}
        width={this.genericImg.naturalWidth}
        height={this.genericImg.naturalHeight}
        fillPatternImage={this.genericImg}
      ></Rect>
    ) : null;

    const genericText = showGeneric ? (
      <Text
        key={`${this.props.card.id}-genericText`}
        x={genericX}
        y={genericY}
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
        align="center"
        verticalAlign="middle"
        fontSize={24}
      ></Text>
    ) : null;

    return [
      damageToken,
      damageText,
      threatToken,
      threatText,
      genericToken,
      genericText,
    ];
  }
}

export default CardTokens;
