import { Skia } from "@shopify/react-native-skia";
import { Dimensions, PixelRatio } from "react-native";



const DPR = PixelRatio.get(); // 🔑 critical

export function drawImageLayer({
  canvas,
  layer,
  skImage,
  canvasWidth = 1080,
  canvasHeight = 1920,
   editorHeight,
          editorWidth
}) {
  if (!canvas || !layer || !skImage) return;

  const {
    x = 0,
    y = 0,
    rotation = 0,
    scale = 1,
    data: { width = 300, height = 500 } = {},
  } = layer;
const scaleX = canvasWidth / editorWidth;
const scaleY = canvasHeight / editorHeight;

const px = x * scaleX;
const py = y * scaleY;
  const boxW = (width / editorWidth) * canvasWidth;
  const boxH = (height / editorHeight) * canvasHeight;

  const imgW = skImage.width();
  const imgH = skImage.height();

  // contain logic
  const containScale = Math.min(boxW / imgW, boxH / imgH);
  const drawW = imgW * containScale;
  const drawH = imgH * containScale;

  const offsetX = (boxW - drawW) / 2;
  const offsetY = (boxH - drawH) / 2;

  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  canvas.save();
const rotationDeg = (rotation * 180) / Math.PI;

  // pivot at layer center
  canvas.translate(px + boxW / 2, py + boxH / 2);
  if (rotation) {
   canvas.rotate(rotationDeg,0, 0);
  }
  canvas.scale(scale, scale);

  canvas.translate(-boxW / 2, -boxH / 2);

  canvas.drawImageRect(
    skImage,
    Skia.XYWHRect(0, 0, imgW, imgH),
    Skia.XYWHRect(
      offsetX,
      offsetY,
      drawW,
      drawH
    ),
    paint
  );

  canvas.restore();
}
