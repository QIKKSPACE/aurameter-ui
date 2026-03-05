import { Skia } from "@shopify/react-native-skia";

export function drawImageLayer({
  canvas,
  layer,
  skImage,
  canvasWidth = 1080,
  canvasHeight = 1920,
}) {
  if (!canvas || !layer || !skImage) return;

  const {
    x = 0,
    y = 0,
    rotation = 0,
    scale = 1,
    data: { width = 300, height = 500 } = {},
  } = layer;

  // ✅ already canvas space
  const px = x;
  const py = y;
  const boxW = width;
  const boxH = height;

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

  const rotationDeg = (rotation * 180) / Math.PI;

  canvas.save();

  // pivot at layer center
  canvas.translate(px + boxW / 2, py + boxH / 2);

  if (rotation) {
    canvas.rotate(rotationDeg, 0, 0);
  }

  canvas.scale(scale, scale);

  canvas.translate(-boxW / 2, -boxH / 2);

  canvas.drawImageRect(
    skImage,
    Skia.XYWHRect(0, 0, imgW, imgH),
    Skia.XYWHRect(offsetX, offsetY, drawW, drawH),
    paint
  );

  canvas.restore();
}
