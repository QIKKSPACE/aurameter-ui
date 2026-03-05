import React, { useRef, useEffect, useCallback } from "react";
import { View, ImageBackground, Animated, StyleSheet, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

/**
 * Fully optimized ScreenBack
 * - background: { type: "color"|"gradient"|"image", color?, gradient?, image? }
 * - never re-renders unnecessarily
 */
const ScreenBack = React.memo(({ background }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // refs instead of state to prevent re-render
  const prevBgRef = useRef(background);
  const nextBgRef = useRef(background);

  useEffect(() => {
    nextBgRef.current = background;   

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
      prevBgRef.current = background;
    });
  }, [background, fadeAnim]);

  const renderBackground = useCallback((bg) => {
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
          <View style={[StyleSheet.absoluteFill, { backgroundColor: bg.color || "#000" }]} />
        );
    }
  }, []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: -9999 }]}>
      {/* previous background */}
      {renderBackground(prevBgRef.current)}

      {/* animated new background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        {renderBackground(nextBgRef.current)}
      </Animated.View>
    </View>
  );
});

export default ScreenBack;
