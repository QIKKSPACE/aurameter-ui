import React from "react";
import { Text } from "react-native";
import { ms } from "react-native-size-matters";
import { Typography } from "../themes/typography";
import { Fonts } from "../themes/fonts";
import { useTheme } from "../constants/context/ThemeContext";

export default function AppText({
  variant = "body",
  weight,
  color,
  style,
  numberOfLines,   // <-- added this
  children,
  ...props
}) {
  const { theme } = useTheme();
  const config = Typography[variant];

  const fontFamily = weight
    ? Fonts[config.font][weight]
    : Fonts[config.font][config.weight];

  return (
    <Text
      style={[
        {
          fontSize: ms(config.size),
          fontFamily,
          color: color || theme.text.primary,
          lineHeight: ms(config.lineHeight),
        },
        style,
      ]}
      numberOfLines={numberOfLines}  // <-- applied here
      {...props}
    >
      {children}
    </Text>
  );
}
