
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Ball from './Ball';

export default React.memo(function Tube({
  tubeIndex,
  balls,
  capacity,
  ballSize,
  highlightedTop,
  tubeWidth,
  tubeHeight,
  onLayout,
}) {
  const slots = useMemo(() => Array.from({ length: capacity }, (_, i) => i), [capacity]);

  return (
    <View
      onLayout={(e) => onLayout?.(tubeIndex, e.nativeEvent.layout)}
      style={[styles.tube, { width: tubeWidth, height: tubeHeight, borderRadius: tubeWidth / 2 }]}
    >
      {/* render from bottom to top visually */}
      {slots.map((i) => {
        const ball = balls[balls.length - 1 - i];
        if (!ball) return <View key={`slot-${i}`} style={{ height: ballSize, width: ballSize }} />;
        const isTop = i === 0; // top visible ball in visual stack
        return (
          <View key={`ball-${i}`} style={{ alignItems: 'center', justifyContent: 'center', height: ballSize }}>
            <Ball color={ball} size={ballSize * 0.9} highlighted={isTop && highlightedTop} />
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  tube: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 10,
  },
});