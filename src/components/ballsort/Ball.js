import React from "react";
import { View } from "react-native";

const Ball = ({ color, size = 40 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      marginBottom: 6,
    }}
  />
);

export default React.memo(Ball);
