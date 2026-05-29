import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Circle, RadialGradient, vec, Shadow } from '@shopify/react-native-skia';

const PremiumBall = ({ color, size, style, isHidden = false }) => {
  const radius = size / 2;
  
  // Create a slightly lighter version of the color for the highlight
  const highlightColor = '#FFFFFF'; 
  const shadowColor = '#00000099';

  if (isHidden) {
    return <View style={[style, { width: size, height: size }]} />;
  }

  return (
    <View style={[style, { width: size, height: size }]}>
      <Canvas style={{ flex: 1 }}>
        <Circle cx={radius} cy={radius} r={radius - 1}>
          <RadialGradient
            c={vec(radius * 0.7, radius * 0.7)} // highlight position
            r={radius * 1.5}
            colors={[highlightColor, color, '#000000']}
            positions={[0, 0.4, 1.2]}
          />
          <Shadow dx={0} dy={2} blur={4} color={shadowColor} />
        </Circle>
      </Canvas>
    </View>
  );
};

export default React.memo(PremiumBall);
