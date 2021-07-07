import { Component } from "react";
import * as React from "react";
import { ICardStack } from "./features/cards/initialState";
import { Group, Rect, Text } from "react-konva";
import { cardConstants } from "./constants/card-constants";
import { GameType } from "./constants/app-constants";
import { GamePropertiesMap } from "./constants/game-type-properties-mapping";
import cloneDeep from "lodash.clonedeep";

interface IProps {
  currentGameType: GameType;
  x: number;
  y: number;
  card: ICardStack | undefined;
}

interface IState {
  imagesLoaded: {
    [K: string]: boolean;
  };
}

const desiredWidth = 36;
const desiredHeight = 36;

class CardModifiers extends Component<IProps, IState> {
  private imgs: { [K: string]: HTMLImageElement };
  private unmounted: boolean;

  constructor(props: IProps) {
    super(props);

    this.unmounted = true;

    this.imgs = {};

    const modifiersInfo =
      GamePropertiesMap[this.props.currentGameType].modifiers;

    const newImagesLoaded: {
      [K: string]: boolean;
    } = {};

    modifiersInfo.forEach((m) => {
      this.imgs[m.attributeId] = new Image();
      newImagesLoaded[m.attributeId] = false;
    });

    this.state = {
      imagesLoaded: newImagesLoaded,
    };

    // set up onload
    modifiersInfo.forEach((m) => {
      this.imgs[m.attributeId].onload = () => {
        if (!this.unmounted) {
          const updatedImagesLoaded = cloneDeep(this.state.imagesLoaded);
          updatedImagesLoaded[m.attributeId] = true;
          this.setState({
            imagesLoaded: updatedImagesLoaded,
          });
        }
      };
    });

    // set up the img src values
    modifiersInfo.forEach((m) => {
      if (!!this.props.card?.modifiers[m.attributeId]) {
        this.imgs[m.attributeId].src = m.icon;
      }
    });
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    const modifiersInfo =
      GamePropertiesMap[this.props.currentGameType].modifiers;

    // handle change
    modifiersInfo.forEach((m) => {
      if (
        !this.state.imagesLoaded[m.attributeId] &&
        !prevProps.card?.modifiers[m.attributeId] &&
        !!this.props.card?.modifiers[m.attributeId]
      ) {
        this.imgs[m.attributeId].src = m.icon;
      }
    });
  }

  public componentDidMount() {
    this.unmounted = false;
  }

  public componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    if (!this.props.card) return null;
    if (!this.props.card?.modifiers) return null;

    const modifiersInfo =
      GamePropertiesMap[this.props.currentGameType].modifiers;

    const nodesToRender: JSX.Element[] = [];

    modifiersInfo.forEach((m) => {
      const modifierX =
        this.props.x + cardConstants.CARD_WIDTH / 2 - desiredWidth / 2;
      const modifierTextX = modifierX + desiredWidth - 2;
      const modifierY =
        this.props.y -
        cardConstants.CARD_HEIGHT / 2 +
        10 * (m.slot - 1) +
        desiredHeight * (m.slot - 1);
      const showModifier =
        this.state.imagesLoaded[m.attributeId] &&
        !!this.props.card?.modifiers[m.attributeId];

      const img = this.imgs[m.attributeId];

      const modifierValue = this.props.card?.modifiers[m.attributeId];

      const modifierToken = showModifier ? (
        <Rect
          key={`${this.props.card?.id}-${m.attributeId}-modifier-token`}
          x={modifierX}
          y={modifierY}
          scale={{
            x: desiredWidth / img.naturalWidth,
            y: desiredHeight / img.naturalHeight,
          }}
          width={img.naturalWidth}
          height={img.naturalHeight}
          fillPatternImage={img}
        ></Rect>
      ) : null;

      const modifierText = showModifier ? (
        <Group
          key={`${this.props.card?.id}-${m.attributeId}-modifier-text`}
          x={modifierTextX}
          y={modifierY}
          width={20}
          height={desiredHeight}
        >
          <Rect width={40} height={desiredHeight} fill="white"></Rect>
          <Text
            width={40}
            height={desiredHeight}
            text={`${modifierValue && modifierValue > 0 ? "+" : ""}${
              modifierValue ?? "?"
            }`}
            fill="black"
            background="white"
            align="center"
            verticalAlign="middle"
            fontSize={24}
          ></Text>
        </Group>
      ) : null;

      if (!!modifierToken) {
        nodesToRender.push(modifierToken);
      }
      if (!!modifierText) {
        nodesToRender.push(modifierText);
      }
    });

    // const damageX = this.props.x - desiredWidth / 2;
    // const damageY = this.props.y - cardConstants.CARD_HEIGHT / 2 + 20;
    // const showDamage =
    //   this.state.imagesLoaded.damage && !!this.props.card.counterTokens.damage;

    // const damageToken = showDamage ? (
    //   <Rect
    //     key={`${this.props.card.id}-damageToken`}
    //     x={damageX}
    //     y={damageY}
    //     scale={{
    //       x: desiredWidth / this.damageImg.naturalWidth,
    //       y: desiredHeight / this.damageImg.naturalHeight,
    //     }}
    //     width={this.damageImg.naturalWidth}
    //     height={this.damageImg.naturalHeight}
    //     fillPatternImage={this.damageImg}
    //   ></Rect>
    // ) : null;

    // const damageText = showDamage ? (
    //   <Text
    //     key={`${this.props.card.id}-damageText`}
    //     x={damageX}
    //     y={damageY}
    //     width={
    //       this.damageImg.naturalWidth *
    //       (desiredWidth / this.damageImg.naturalWidth)
    //     }
    //     height={
    //       this.damageImg.naturalHeight *
    //       (desiredHeight / this.damageImg.naturalHeight)
    //     }
    //     text={`${this.props.card.counterTokens.damage}`}
    //     fill="white"
    //     align="center"
    //     verticalAlign="middle"
    //     fontSize={24}
    //   ></Text>
    // ) : null;

    // const threatX = this.props.x - desiredWidth / 2;
    // const threatY = damageY + desiredHeight + 5;
    // const showThreat =
    //   this.state.imagesLoaded.threat && !!this.props.card.counterTokens.threat;

    // const threatToken = showThreat ? (
    //   <Rect
    //     key={`${this.props.card.id}-threatToken`}
    //     x={threatX}
    //     y={threatY}
    //     scale={{
    //       x: desiredWidth / this.threatImg.naturalWidth,
    //       y: desiredHeight / this.threatImg.naturalHeight,
    //     }}
    //     width={this.threatImg.naturalWidth}
    //     height={this.threatImg.naturalHeight}
    //     fillPatternImage={this.threatImg}
    //   ></Rect>
    // ) : null;

    // const threatText = showThreat ? (
    //   <Text
    //     key={`${this.props.card.id}-threatText`}
    //     x={threatX}
    //     y={threatY}
    //     width={
    //       this.threatImg.naturalWidth *
    //       (desiredWidth / this.threatImg.naturalWidth)
    //     }
    //     height={
    //       this.threatImg.naturalHeight *
    //       (desiredHeight / this.threatImg.naturalHeight)
    //     }
    //     text={`${this.props.card.counterTokens.threat}`}
    //     fill="white"
    //     align="center"
    //     verticalAlign="middle"
    //     fontSize={24}
    //   ></Text>
    // ) : null;

    // const genericX = this.props.x - desiredWidth / 2;
    // const genericY = threatY + desiredHeight + 5;
    // const showGeneric =
    //   this.state.imagesLoaded.generic &&
    //   !!this.props.card.counterTokens.generic;

    // const genericToken = showGeneric ? (
    //   <Rect
    //     key={`${this.props.card.id}-genericToken`}
    //     x={genericX}
    //     y={genericY}
    //     scale={{
    //       x: desiredWidth / this.genericImg.naturalWidth,
    //       y: desiredHeight / this.genericImg.naturalHeight,
    //     }}
    //     width={this.genericImg.naturalWidth}
    //     height={this.genericImg.naturalHeight}
    //     fillPatternImage={this.genericImg}
    //   ></Rect>
    // ) : null;

    // const genericText = showGeneric ? (
    //   <Text
    //     key={`${this.props.card.id}-genericText`}
    //     x={genericX}
    //     y={genericY}
    //     width={
    //       this.genericImg.naturalWidth *
    //       (desiredWidth / this.genericImg.naturalWidth)
    //     }
    //     height={
    //       this.genericImg.naturalHeight *
    //       (desiredHeight / this.genericImg.naturalHeight)
    //     }
    //     text={`${this.props.card.counterTokens.generic}`}
    //     fill="white"
    //     align="center"
    //     verticalAlign="middle"
    //     fontSize={24}
    //   ></Text>
    // ) : null;

    return nodesToRender;
  }
}

export default CardModifiers;
