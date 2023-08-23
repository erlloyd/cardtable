import { SceneContext } from "konva/lib/Context";
import { ShapeConfig } from "konva/lib/Shape";
import { ImageConfig } from "konva/lib/shapes/Image";
import { useCallback } from "react";
import { Group, Image } from "react-konva";
import useImage from "use-image";

interface IProps extends ShapeConfig {
  imgUrls: string[];
}

export const SimpleImage = (props: IProps) => {
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

  if (!image) return null;

  const radius = 5;

  const horizontalImage = image.naturalWidth > image.naturalHeight;
  const rotation = horizontalImage ? -90 : 0;
  const offset = horizontalImage
    ? { x: props.height || 0, y: 0 }
    : { x: 0, y: 0 };
  const widthToUse = horizontalImage ? props.height : props.width;
  const heightToUse = horizontalImage ? props.width : props.height;

  return (
    status !== "loading" && (
      <Group {...props} clipFunc={calcClipFunc}>
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
    )
  );
};
