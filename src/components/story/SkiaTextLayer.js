import React, { useMemo } from "react";
import { Canvas, Text as SkiaText, useFont, Image as SkiaImage } from "@shopify/react-native-skia";
import { Image as RNImage } from "react-native";

/* Emoji detection regex (basic) */
const EMOJI_REGEX = /([\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu;

export default function SkiaTextLayer({
  text,
  fontSize = 24,
  color = "#000",
  maxWidth = 300,
  zIndex = 1,
}) {
  // Load Roboto
  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), fontSize * 3);
  if (!font) return null;

  // Metrics
  const metrics = font.getMetrics();
  const baseline = -metrics.ascent;

  // Split text into normal + emojis
  const segments = useMemo(() => {
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = EMOJI_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: "emoji", value: match[0] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", value: text.slice(lastIndex) });
    }
    return parts;
  }, [text]);

  // Measure width
  const width = useMemo(() => {
    let w = 0;
    segments.forEach((seg) => {
      if (seg.type === "text") w += font.getTextWidth(seg.value);
      else w += fontSize * 1.2; // emoji approx width
    });
    return Math.min(w, maxWidth);
  }, [segments, font, fontSize, maxWidth]);

  const height = metrics.descent - metrics.ascent;

  // X position for each segment
  let cursorX = 0;

  return (
    <Canvas
      style={{
        width,
        height,
        position: "absolute",
        zIndex,
        // backgroundColor: "rgba(255,0,0,0.1)", // debug
      }}
    >
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          const x = cursorX;
          cursorX += font.getTextWidth(seg.value);
          return (
            <SkiaText
              key={i}
              text={seg.value}
              x={x}
              y={baseline}
              font={font}
              color={color}
            />
          );
        } else if (seg.type === "emoji") {
          const size = fontSize * 3; // scale like font
          const x = cursorX;
          cursorX += size * 0.9; // advance
          return (
            <SkiaImage
              key={i}
              x={x}
              y={0}
              width={size}
              height={size}
              image={RNImage.resolveAssetSource(require("../../assets/emoji.png")).uri} // placeholder emoji image
            />
          );
        }
        return null;
      })}
    </Canvas>
  );
}
