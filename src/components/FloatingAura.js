import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

export default function FloatingAura({
  value,
  index,
  onFinish,
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    translateY.value = withTiming(
      -220 - index * 30,
      {
        duration: 1800,
        easing: Easing.out(Easing.exp),
      }
    );

    opacity.value = withTiming(0, {
      duration: 1800,
    });

    scale.value = withTiming(1.3, {
      duration: 800,
    });

    const timeout = setTimeout(() => {
      onFinish?.();
    }, 1900);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const positive = value > 0;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: positive
            ? "rgba(34,197,94,0.18)"
            : "rgba(239,68,68,0.18)",
          borderColor: positive
            ? "#22c55e"
            : "#ef4444",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: positive ? "#22c55e" : "#ef4444",
          },
        ]}
      >
        {positive ? "+" : ""}
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    bottom: 140,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 999,
    borderWidth: 1.5,
  },

  text: {
    fontSize: 24,
    fontWeight: "800",
  },
});