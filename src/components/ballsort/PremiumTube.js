import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import PremiumBall from './PremiumBall';

const PremiumTube = ({ 
  tube, 
  capacity, 
  ballSize, 
  isSelected, 
  movingBallIndex = -1, // Which ball is currently hidden because it's in the animator overlay
  onLayout,
  isComplete
}) => {
  
  // The tube itself has subtle glass/recessed effect
  const tubeWidth = ballSize + 12;
  const tubeHeight = (capacity * ballSize) + 20;

  return (
    <Animated.View 
      style={[
        styles.tubeWrapper,
        { width: tubeWidth, height: tubeHeight }
      ]}
      onLayout={onLayout}
    >
      {/* Background shadow for depth */}
      <View style={[styles.tubeBackground, {
        borderColor: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
        backgroundColor: isComplete ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
      }]}>
        {/* Glow effect when selected */}
        {isSelected && (
          <View style={styles.glow} />
        )}
      </View>
      
      {/* Balls Container */}
      <View style={styles.ballsContainer}>
        {tube.map((color, index) => {
          const isHidden = (index === tube.length - 1) && (index === movingBallIndex);
          const bottom = 8 + (index * (ballSize + 2));
          return (
            <View
              key={`ball-slot-${index}-${color}`}
              style={[
                styles.ballSlot,
                {
                  bottom,
                  width: ballSize,
                  height: ballSize,
                },
              ]}
            >
              <PremiumBall
                color={color}
                size={ballSize}
                isHidden={isHidden}
              />
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tubeWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  tubeBackground: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderWidth: 2,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    overflow: 'hidden', // To clip inner glow
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  ballsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  ballSlot: {
    position: 'absolute',
  }
});

export default React.memo(PremiumTube);
