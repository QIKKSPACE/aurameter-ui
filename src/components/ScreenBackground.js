import React, { useEffect, useRef, useState } from "react";
import { View, ImageBackground, Animated, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../constants/context/ThemeContext";

const ScreenBackground = ({ children }) => {
  const { theme } = useTheme();
  const { background } = theme;

  const [prevBackground, setPrevBackground] = useState(background);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // When background changes, fade between them smoothly
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPrevBackground(background);
    });
  }, [background]);

  const renderBackground = (bg) => {
    switch (bg.type) {
      case "image":
        return (
          <ImageBackground
            source={bg.image}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        );
      case "gradient":
        return (
          <LinearGradient
            colors={bg.gradient || ["#000", "#333"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        );
      case "color":
      default:
        return (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: bg.color || "#fff" }]}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* previous background stays behind during transition */}
      {renderBackground(prevBackground)}

      {/* fade overlay for smooth switch */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        {renderBackground(background)}
      </Animated.View>
   
      {/* children never re-mounted */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

export default React.memo(ScreenBackground);
