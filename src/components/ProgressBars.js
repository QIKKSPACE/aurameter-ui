import React from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProgressBars({ progress, currentIndex, total }) {
  const barWidth = SCREEN_WIDTH * 0.98 / total; // 98% width distributed equally
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth],
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.track, { width: barWidth }]}>
          <Animated.View
            style={[
              styles.bar,
              {
                width:
                  i === currentIndex
                    ? progressWidth
                    : i < currentIndex
                    ? barWidth
                    : 0,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 5,
    flexDirection: "row",
    width: "98%",
    height: 4,
    alignSelf: "center",
    zIndex: 10,
    justifyContent: "space-between",
  },
  track: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
  },
});
