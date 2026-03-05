import RNFS from "react-native-fs";
import { Skia } from "@shopify/react-native-skia";
import { Platform } from "react-native";

export async function loadSkImageFromUri(uri) {
  if (!uri) {
    console.warn("loadSkImageFromUri: no URI provided");
    return null;
  }

  try {
    let path = uri;

    // ─────────────────────────────────────
    // 1️⃣ Remote URL → download to cache
    // ─────────────────────────────────────
    if (uri.startsWith("http")) {
      const filename = uri.split("/").pop()?.split("?")[0] || `img_${Date.now()}`;
      const dest = `${RNFS.CachesDirectoryPath}/${filename}`;

      const exists = await RNFS.exists(dest);
      if (!exists) {
        await RNFS.downloadFile({
          fromUrl: uri,
          toFile: dest,
        }).promise;
      }

      path = dest;
    }

    // ─────────────────────────────────────
    // 2️⃣ Android content:// → copy to file
    // ─────────────────────────────────────
    if (Platform.OS === "android" && uri.startsWith("content://")) {
      const dest = `${RNFS.CachesDirectoryPath}/img_${Date.now()}`;
      await RNFS.copyFile(uri, dest);
      path = dest;
    }

    // ─────────────────────────────────────
    // 3️⃣ Read local file as base64
    // ─────────────────────────────────────
    const base64 = await RNFS.readFile(path, "base64");
    if (!base64) {
      console.warn("loadSkImageFromUri: empty base64");
      return null;
    }

    // ─────────────────────────────────────
    // 4️⃣ Create Skia image
    // ─────────────────────────────────────
    const skData = Skia.Data.fromBase64(base64);
    if (!skData) {
      console.warn("Skia.Data.fromBase64 failed");
      return null;
    }

    let image = Skia.Image.MakeImageFromEncoded(skData);
    if (!image) {
      console.warn("Skia.Image.MakeImageFromEncoded failed");
      return null;
    }

    // ─────────────────────────────────────
    // 5️⃣ Android safety: CPU-backed image
    // ─────────────────────────────────────
    if (
      Platform.OS === "android" &&
      typeof image.makeNonTextureImage === "function"
    ) {
      image = image.makeNonTextureImage();
    }

    return image;
  } catch (err) {
    console.error("loadSkImageFromUri failed:", err);
    return null;
  }
}
