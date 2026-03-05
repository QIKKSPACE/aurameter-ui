import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.72;
const MAX_IMAGE_HEIGHT = 320;

const FullWidthImage = ({
  uri,
  borderRadius = 14,
  resizeMode = "contain",
}) => {
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!uri) return;

    if (typeof uri === "number") {
      const source = Image.resolveAssetSource(uri);
      setSize({ width: source.width, height: source.height });
    } else {
      Image.getSize(
        uri,
        (width, height) => setSize({ width, height }),
        () => setSize({ width: 1, height: 1 })
      );
    }
  }, [uri]);

  if (!uri) return null;

  // Skeleton placeholder
  if (!size) {
    return (
      <View style={[styles.skeleton, { borderRadius }]}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  }

  const aspectRatio = size.width / size.height;

  let width = MAX_BUBBLE_WIDTH;
  let height = width / aspectRatio;

  // Cap height (for very tall images)
  if (height > MAX_IMAGE_HEIGHT) {
    height = MAX_IMAGE_HEIGHT;
    width = height * aspectRatio;
  }

  return (
    <View style={{ marginTop: 6 }}>
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
  image: {
    backgroundColor: "#eee",
  },
  skeleton: {
    width: MAX_BUBBLE_WIDTH,
    height: 180,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FullWidthImage;
