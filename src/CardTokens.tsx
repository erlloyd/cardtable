import { Component } from "react";
import * as React from "react";
import { ICardStack } from "./features/cards/initialState";
import { Rect, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
interface IProps {
  x: number;
  y: number;
  card: ICardStack;
}

interface IState {
  imagesLoaded: {
    damage: boolean;
    threat: boolean;
    generic: boolean;
  };
}

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

    if (true) {
      // TODO: Replace with checking if there's damage
      this.damageImg.src =
        process.env.PUBLIC_URL + "/images/standard/damage.png";
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

    if (true) {
      // TODO: Replace with checking if there's threat
      this.threatImg.src =
        process.env.PUBLIC_URL + "/images/standard/threat.png";
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

    if (true) {
      // TODO: Replace with checking if there's generic
      this.genericImg.src =
        process.env.PUBLIC_URL + "/images/standard/generic_counter.png";
    }
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const damageX = this.props.x - this.damageImg.naturalWidth / 2;
    const damageY = this.props.y - cardConstants.CARD_HEIGHT / 2 + 20;
    const damageToken = this.state.imagesLoaded.damage ? (
      <Rect
        key={`${this.props.card.id}-damageToken`}
        x={damageX}
        y={damageY}
        width={this.damageImg.naturalWidth}
        height={this.damageImg.naturalHeight}
        fillPatternImage={this.damageImg}
      ></Rect>
    ) : null;

    const damageText = this.state.imagesLoaded.damage ? (
      <Text
        key={`${this.props.card.id}-damageText`}
        x={damageX}
        y={damageY}
        width={this.damageImg.naturalWidth}
        height={this.damageImg.naturalHeight}
        text="2"
        fill="white"
        align="center"
        verticalAlign="middle"
        fontSize={24}
      ></Text>
    ) : null;

    const threatX = this.props.x - this.threatImg.naturalWidth / 2;
    const threatY = damageY + this.damageImg.naturalHeight + 5;

    const threatToken = this.state.imagesLoaded.threat ? (
      <Rect
        key={`${this.props.card.id}-threatToken`}
        x={threatX}
        y={threatY}
        width={this.threatImg.naturalWidth}
        height={this.threatImg.naturalHeight}
        fillPatternImage={this.threatImg}
      ></Rect>
    ) : null;

    const threatText = this.state.imagesLoaded.threat ? (
      <Text
        key={`${this.props.card.id}-threatText`}
        x={threatX}
        y={threatY}
        width={this.threatImg.naturalWidth}
        height={this.threatImg.naturalHeight}
        text="3"
        fill="white"
        align="center"
        verticalAlign="middle"
        fontSize={24}
      ></Text>
    ) : null;

    const genericX = this.props.x - this.threatImg.naturalWidth / 2;
    const genericY = threatY + this.threatImg.naturalHeight + 5;

    const genericToken = this.state.imagesLoaded.generic ? (
      <Rect
        key={`${this.props.card.id}-genericToken`}
        x={genericX}
        y={genericY}
        width={this.genericImg.naturalWidth}
        height={this.genericImg.naturalHeight}
        fillPatternImage={this.genericImg}
      ></Rect>
    ) : null;

    const genericText = this.state.imagesLoaded.generic ? (
      <Text
        key={`${this.props.card.id}-genericText`}
        x={genericX}
        y={genericY}
        width={this.genericImg.naturalWidth}
        height={this.genericImg.naturalHeight}
        text="4"
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
