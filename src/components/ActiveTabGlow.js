// components/ActiveTabGlow.js
import React from "react";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";

const ActiveTabGlow = ({ size = 60, color = "#3B82F6" }) => {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#glow)" />
    </Svg>
  );
};

export default ActiveTabGlow;
