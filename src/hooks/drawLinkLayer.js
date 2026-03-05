import { Skia, TextAlign } from "@shopify/react-native-skia";

export function drawLinkLayer({ canvas, layer, editorScale }) {
  if (!canvas || !layer?.data?.text) return;

  const {
    text,
    color = "#000",
    fontFamily = "System",
    fontSize = 14,
    backgroundColor = "#fff",
    width = 150,
    height = 46,
    align = "center",
  } = layer.data;

  const x = layer.x ?? 0;
  const y = layer.y ?? 0;
  const scale = layer.scale ?? 1;
  const rotationDeg = ((layer.rotation ?? 0) * 180) / Math.PI;

  /* ───── Design space ───── */
  const dsWidth = width / editorScale;
  const dsHeight = height / editorScale;
  const dsFontSize = fontSize / editorScale;

  /* ───── Paragraph ───── */
  const paragraphBuilder = Skia.ParagraphBuilder.Make(
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

  paragraphBuilder.pushStyle({
    color: Skia.Color(color),
    fontSize: dsFontSize,
    fontFamilies: [fontFamily],
  });

  paragraphBuilder.addText(String(text));
  paragraphBuilder.pop();

  const paragraph = paragraphBuilder.build();
  paragraph.layout(dsWidth);

  const textHeight = paragraph.getHeight();

  /* ───── Geometry ───── */
  const rect = Skia.XYWHRect(0, 0, dsWidth, dsHeight);
  const rrect = Skia.RRectXY(rect, dsHeight / 2, dsHeight / 2);

  const paint = Skia.Paint();
  paint.setColor(Skia.Color(backgroundColor));
  paint.setAntiAlias(true);

  /* ───── Draw (RN-compatible transform order) ───── */
  canvas.save();

  // 1️⃣ top-left positioning (editor space)
  canvas.translate(x, y);

  // 2️⃣ move origin to center
  canvas.translate(dsWidth / 2, dsHeight / 2);

  // 3️⃣ rotate & scale around center
  canvas.rotate(rotationDeg,0,0);
  canvas.scale(scale, scale);

  // 4️⃣ move back to top-left
  canvas.translate(-dsWidth / 2, -dsHeight / 2);

  // 5️⃣ draw background
  canvas.drawRRect(rrect, paint);

  // 6️⃣ draw text (vertically centered)
  paragraph.paint(
    canvas,
    0,
    (dsHeight - textHeight) / 2
  );

  canvas.restore();
}
