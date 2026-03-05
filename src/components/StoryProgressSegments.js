import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

export function StoryProgressSegments({
  count,
  activeIndex,
  progress,
}) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => {
        if (i < activeIndex) {
          // completed
          return <View key={i} style={[styles.segment, styles.filled]} />;
        }

        if (i === activeIndex) {
          // active
          const animatedStyle = useAnimatedStyle(() => ({
            width: `${progress.value * 100}%`,
          }));

          return (
            <View key={i} style={styles.segment}>
              <Animated.View
                style={[styles.fill, animatedStyle]}
              />
            </View>
          );
        }

        // upcoming
        return <View key={i} style={styles.segment} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    padding: 8,
    zIndex:999
  },
  segment: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  filled: {
    backgroundColor: "#fff",
  },
});
