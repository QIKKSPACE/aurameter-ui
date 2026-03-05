import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Ball from "./Ball";

const MovingBall = ({ left, top, size, color }) => {
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: left.value,
    top: top.value,
  }));

  return (
    <Animated.View style={style}>
      <Ball color={color} size={size} />
    </Animated.View>
  );
};

export default MovingBall;
