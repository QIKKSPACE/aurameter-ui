import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import Icon from "@react-native-vector-icons/material-icons";

const MarqueeText = ({ text, width = 200 }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (contentWidth > width) {
      // reset before starting
      scrollAnim.setValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // loop animation
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scrollAnim, {
            toValue: -(contentWidth - width + 20),
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scrollAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      scrollAnim.setValue(0);
    }
  }, [contentWidth, width]);

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View
        style={[styles.marqueeRow, { transform: [{ translateX: scrollAnim }] }]}
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
      >
        <Icon name="location-pin" size={20} color="white" style={styles.icon} />
        <Animated.Text numberOfLines={1} style={styles.text}>
          {text}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: 24,
    justifyContent: "center",
  },
  marqueeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    color: "white",
  },
});

export default MarqueeText;
