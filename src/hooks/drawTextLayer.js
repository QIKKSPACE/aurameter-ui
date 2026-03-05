import { Skia, TextAlign } from "@shopify/react-native-skia";

export function drawTextLayer({
  canvas,
  layer,
  maxWidth = 1000,
  canvasWidth = 1080,
  canvasHeight = 1920,
}) {
  if (!canvas || !layer?.data?.text) return;

  const {
    text,
    color = "#ffffff",
    fontSize = 36,
    align = "left",
    fontFamily = "Roboto",
  } = layer.data;

  const x = layer.x ?? 0;            // ✅ already canvas space
  const y = layer.y ?? 0;
  const scale = layer.scale ?? 1;
  const rotationRad = layer.rotation ?? 0;

const breathingPx = Math.ceil(fontSize*3 * scale * 0.5);
const widthPx = Math.round((layer.width*scale ?? maxWidth) + breathingPx);

  /* ───────── Paragraph ───────── */
  const builder = Skia.ParagraphBuilder.Make(
    {
      textAlign:
        align === "center"
          ? TextAlign.Center
          : align === "right"
          ? TextAlign.Right
          : TextAlign.Left,
    },
    Skia.FontMgr.System()
  );

  builder.pushStyle({
    color: Skia.Color(color),
    fontSize:fontSize*3,                // ✅ DO NOT pre-scale
    fontFamilies: [fontFamily],
  });

  builder.addText(String(text));
  builder.pop();

  const paragraph = builder.build();
  paragraph.layout(widthPx);

  /* ───────── Measure ───────── */
  const lineWidth = paragraph.getLongestLine();
  const paragraphHeight = paragraph.getHeight();
const lineMetrics = paragraph.getLineMetrics(); // returns array of line info
const singleLineHeight = lineMetrics.length > 0 ? lineMetrics[0].height :0;
console.error(singleLineHeight)
  /* ───────── Alignment fix ───────── */
  let alignFixX = 0;
  if (align === "center") {
    alignFixX = (widthPx - lineWidth)*scale / 2;
  } else if (align === "right") {
    alignFixX = widthPx - lineWidth;
  }

  /* ───────── Draw (center-scaled, rotated) ───────── */
  const centerX = x + lineWidth / 2;
  const centerY = y + paragraphHeight / 2;
  const rotationDeg = (rotationRad * 180) / Math.PI;

  canvas.save();

  canvas.translate(centerX, centerY);
  canvas.rotate(rotationDeg, 0, 0);
  canvas.scale(scale, scale);
  canvas.translate(-centerX, -centerY);

  paragraph.paint(canvas, x - alignFixX, y+singleLineHeight/6);

  canvas.restore();
}
