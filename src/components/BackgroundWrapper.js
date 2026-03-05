// src/components/BackgroundWrapper.js
import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../constants/context/ThemeContext";

const BackgroundWrapper = ({ children }) => {
  const { theme } = useTheme();

  // If background is an image
  if (theme.background.type === "image" && theme.background.image) {
    return (
      <ImageBackground
        source={theme.background.image}
        style={styles.flex}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }

  // If background is a gradient
  if (theme.background.type === "gradient" && theme.background.gradient) {
    return (
      <LinearGradient
        colors={theme.background.gradient}
        style={styles.flex}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  // Fallback → solid color
  return (
    <View style={[styles.flex, { backgroundColor: theme.background.color }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default BackgroundWrapper;
