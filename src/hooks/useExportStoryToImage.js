import { Skia } from "@shopify/react-native-skia";
import RNFS from "react-native-fs";
import { Dimensions, Platform } from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { drawTextLayer } from "./drawTextLayer";
import { drawImageLayer } from "./drawImageLayer";
import { drawLinkLayer } from "./drawLinkLayer";

import { loadSkImageFromUri } from "./loadSkImageFromUri";

export async function exportStoryWithSkia(layers = [],editorHeight,editorWidth,editorScale) {
  try {
    const STORY_WIDTH = 1080;
    const STORY_HEIGHT = 1920;

    const surface = Skia.Surface.Make(STORY_WIDTH, STORY_HEIGHT);
    if (!surface) {
      throw new Error("Skia surface creation failed");
    }

    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color("black"));

    // ───────── SORT BY Z-INDEX ─────────
    const sortedLayers = [...layers].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );

    // ───────── PRELOAD IMAGES ─────────
    const imageMap = new Map();

    for (const layer of sortedLayers) {
  if (
    (layer.type === "image" && layer.data?.url) ||
    (layer.type === "sticker" && layer.data?.uri)
  ) {
    const uri =
      layer.type === "image"
        ? layer.data.url
        : layer.data.uri;

    const img = await loadSkImageFromUri(uri);
    if (img) {
      imageMap.set(layer.id, img);
    }
  }
}

    // ───────── DRAW LAYERS (SYNC) ─────────
    for (const layer of sortedLayers) {
      if (layer.type === "text") {
        drawTextLayer({
          canvas,
          layer,
          maxWidth: 1000,
          canvasWidth: STORY_WIDTH,
          canvasHeight: STORY_HEIGHT,
          editorHeight,
          editorWidth,
          editorScale
        });
      }

      if (layer.type === "image") {
        drawImageLayer({
          canvas,
          layer,
          skImage: imageMap.get(layer.id),
          canvasWidth: STORY_WIDTH,
          canvasHeight: STORY_HEIGHT,
           editorHeight,
          editorWidth
        });
      }
        if (layer.type === "sticker") {
        drawImageLayer({
          canvas,
          layer,
          skImage: imageMap.get(layer.id),
          canvasWidth: STORY_WIDTH,
          canvasHeight: STORY_HEIGHT,
           editorHeight,
          editorWidth
        });
      }
              if (layer.type === "link") {
        drawLinkLayer({
          canvas,
          layer,
          canvasWidth: STORY_WIDTH,
          canvasHeight: STORY_HEIGHT,
           editorHeight,
          editorWidth,editorScale
        });
      }
    }

    // ───────── EXPORT IMAGE ─────────
    const image = surface.makeImageSnapshot();
    const base64 = image.encodeToBase64();

    const filePath = `${RNFS.CachesDirectoryPath}/story_${Date.now()}.png`;
    await RNFS.writeFile(filePath, base64, "base64");

    await CameraRoll.save(
      Platform.OS === "android" ? `file://${filePath}` : filePath,
      { type: "photo" }
    );

    return filePath;
  } catch (err) {
    console.error("[exportStoryWithSkia] ERROR", err);
    throw err;
  }
}
