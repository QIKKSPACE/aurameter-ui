

// ---------------------------------------------
// file: /components/Ball.js
// ---------------------------------------------

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

export default React.memo(function Ball({ color, size, highlighted }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.06, duration: 160, useNativeDriver: false }),
            Animated.timing(glow, { toValue: 1, duration: 160, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.0, duration: 160, useNativeDriver: false }),
            Animated.timing(glow, { toValue: 0.6, duration: 160, useNativeDriver: false }),
          ]),
        ])
      ).start();
    } else {
      scale.stopAnimation();
      scale.setValue(1);
      glow.setValue(0);
    }
  }, [highlighted]);

  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] });

  return (
    <Animated.View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }],
          shadowOpacity,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  ball: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});