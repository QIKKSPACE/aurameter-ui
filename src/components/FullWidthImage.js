import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DEFAULT_MAX_WIDTH = SCREEN_WIDTH * 0.72;
const MAX_IMAGE_HEIGHT = 320;

const FullWidthImage = ({
  uri,
  borderRadius = 18,
  resizeMode = "cover",
  maxWidth = DEFAULT_MAX_WIDTH,
}) => {
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!uri) return;

    if (typeof uri === "number") {
      const source = Image.resolveAssetSource(uri);
      setSize({ width: source.width, height: source.height });
      return;
    }

    Image.getSize(
      uri,
      (width, height) => setSize({ width, height }),
      () => setSize({ width: 1, height: 1 })
    );
  }, [uri]);

  if (!uri) return null;

  if (!size) {
    return (
      <View style={[styles.skeleton, { borderRadius, width: maxWidth }]}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  }

  const aspectRatio = size.width / size.height || 1;
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > MAX_IMAGE_HEIGHT) {
    height = MAX_IMAGE_HEIGHT;
  }

  return (
    <View style={styles.container}>
      <Image
        source={typeof uri === "number" ? uri : { uri }}
        style={[
          styles.image,
          {
            width,
            height,
            borderRadius,
          },
        ]}
        resizeMode={resizeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  image: {
    backgroundColor: "#111827",
  },
  skeleton: {
    height: 180,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FullWidthImage;
