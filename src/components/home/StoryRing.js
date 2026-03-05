import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const RING_SIZE = 75;
const STROKE_WIDTH = 3;

const StoryRing = ({ active = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withTiming(1, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      pulse.value = 0;
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 1 + pulse.value * 0.03 }],
  }));

  return (
    <Animated.View style={[styles.ring, animatedStyle]} />
  );
};

export default StoryRing;

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: STROKE_WIDTH,
    borderColor: "#d4af37", // gold
  },
});
