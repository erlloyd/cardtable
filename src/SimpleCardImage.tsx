import { SceneContext } from "konva/lib/Context";
import { ShapeConfig } from "konva/lib/Shape";
import { ImageConfig } from "konva/lib/shapes/Image";
import { MutableRefObject, useCallback } from "react";
import { Group, Image, Rect, Text } from "react-konva";
import useImage from "use-image";

interface IProps extends ShapeConfig {
  imgUrls: string[];
  imageRef: MutableRefObject<any>;
  selected: boolean;
  dropTargetColor?: string;
  code: string;
  name: string;
}

export const SimpleCardImage = (props: IProps) => {
  // console.log("simple image props", props);
  const calcClipFunc = useCallback(
    (ctx: SceneContext) => {
      ctx.beginPath();
      const cornerRadius = 9;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const imageWidth = props.width || 1;
      const imageHeight = props.height || 1;
      let topLeft = 0;
      let topRight = 0;
      let bottomLeft = 0;
      let bottomRight = 0;
      if (typeof cornerRadius === "number") {
        topLeft =
          topRight =
          bottomLeft =
          bottomRight =
            Math.min(cornerRadius, width / 2, height / 2);
      } else {
        topLeft = Math.min(
          cornerRadius[0] || 0,
          imageWidth / 2,
          imageHeight / 2
        );
        topRight = Math.min(
          cornerRadius[1] || 0,
          imageWidth / 2,
          imageHeight / 2
        );
        bottomRight = Math.min(
          cornerRadius[2] || 0,
          imageWidth / 2,
          imageHeight / 2
        );
        bottomLeft = Math.min(
          cornerRadius[3] || 0,
          imageWidth / 2,
          imageHeight / 2
        );
      }
      ctx.moveTo(topLeft, 0);
      ctx.lineTo(imageWidth - topRight, 0);
      ctx.arc(
        imageWidth - topRight,
        topRight,
        topRight,
        (Math.PI * 3) / 2,
        0,
        false
      );
      ctx.lineTo(imageWidth, imageHeight - bottomRight);
      ctx.arc(
        imageWidth - bottomRight,
        imageHeight - bottomRight,
        bottomRight,
        0,
        Math.PI / 2,
        false
      );
      ctx.lineTo(bottomLeft, imageHeight);
      ctx.arc(
        bottomLeft,
        imageHeight - bottomLeft,
        bottomLeft,
        Math.PI / 2,
        Math.PI,
        false
      );
      ctx.lineTo(0, topLeft);
      ctx.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
      ctx.closePath();
    },
    [props.x, props.y, props.height, props.width]
  );

  const imageToUse =
    !!props.imgUrls && props.imgUrls.length > 0 ? props.imgUrls[0] : "";
  const [image, status] = useImage(imageToUse);

  const cardNameText =
    status === "failed" ? (
      <Text
        offset={{ x: -3, y: -50 }}
        width={props.width ?? 0}
        height={props.height ?? 50 - 50}
        key={`${props.id}-cardnametext`}
        fontSize={24}
        text={`${props.name} ${props.code}`}
        fill="black"
      ></Text>
    ) : null;

  const placeholderRect =
    status !== "loaded" ? (
      <Rect
        width={props.width || 0}
        height={props.height || 0}
        offset={{ x: 0, y: 0 }}
        fill={"gray"}
        cornerRadius={9}
      />
    ) : null;

  const radius = 5;

  const horizontalImage = image
    ? image.naturalWidth > image.naturalHeight
    : false;
  const rotation = horizontalImage ? -90 : 0;
  const offset = horizontalImage
    ? { x: props.height || 0, y: 0 }
    : { x: 0, y: 0 };
  const widthToUse = horizontalImage ? props.height : props.width;
  const heightToUse = horizontalImage ? props.width : props.height;

  const groupOffset = { x: (props.width || 0) / 2, y: (props.height || 0) / 2 };
  const groupPos = {
    x: props.x || 0 + groupOffset.x,
    y: props.y || 0 + groupOffset.y,
  };

  const selectedBox =
    props.selected || !!getStrokeColor(props) ? (
      <Rect
        offset={offset}
        x={offset.x}
        y={offset.y}
        width={horizontalImage ? heightToUse : widthToUse}
        height={horizontalImage ? widthToUse : heightToUse}
        cornerRadius={9}
        stroke={getStrokeColor(props)}
        strokeWidth={6}
      />
    ) : null;

  const imageElement =
    image && status === "loaded" ? (
      <Group clipFunc={calcClipFunc}>
        <Image
          offset={offset}
          rotation={rotation}
          width={widthToUse}
          height={heightToUse}
          image={image}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={0}
        />
      </Group>
    ) : null;

  return (
    <Group
      ref={props.imageRef}
      offset={groupOffset}
      x={groupPos.x}
      y={groupPos.y}
      {...props}
    >
      {selectedBox}
      {placeholderRect}
      {cardNameText}
      {imageElement}
    </Group>
  );
};

const getStrokeColor = (props: IProps) => {
  if (!!props.dropTargetColor) {
    return props.dropTargetColor;
  }

  if (props.selected) {
    return props.selectedColor;
  }

  return "";
};
