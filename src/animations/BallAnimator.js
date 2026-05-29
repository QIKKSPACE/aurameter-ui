import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import PremiumBall from '../components/ballsort/PremiumBall';
import { GameHaptics } from '../utils/haptics';
const BallAnimator = ({ 
  ballColor, 
  ballSize, 
  startLayout, 
  endLayout, 
  onAnimationComplete 
}) => {
  const translateX = useSharedValue(startLayout.x);
  const translateY = useSharedValue(startLayout.y);
  const scale = useSharedValue(1);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    // 1. Lift
    const liftY = Math.min(startLayout.y, endLayout.y) - 70;
    const easeOut = Easing.out(Easing.cubic);
    const easeIn = Easing.in(Easing.cubic);
    const travelEase = Easing.bezier(0.2, 0, 0, 1);

    GameHaptics.selectTube();

    translateY.value = withSequence(
      withTiming(liftY, { duration: 110, easing: easeOut }),
      withTiming(liftY, { duration: 130, easing: travelEase }),
      withTiming(endLayout.y, { duration: 120, easing: easeIn }, (isFinished) => {
        if (isFinished) {
          runOnJS(GameHaptics.dropBall)();
          runOnJS(onAnimationComplete)();
        }
      })
    );

    translateX.value = withSequence(
      withTiming(startLayout.x, { duration: 70 }),
      withTiming(endLayout.x, { duration: 170, easing: travelEase })
    );

    // Squash and stretch
    scaleY.value = withSequence(
      withTiming(1.1, { duration: 80 }),
      withTiming(1, { duration: 120 }),
      withTiming(1.15, { duration: 80 }),
      withTiming(1, { duration: 80 })
    );

  }, [startLayout, endLayout, translateX, translateY, scale, scaleY, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scaleX: scale.value },
        { scaleY: scaleY.value }
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.container, animatedStyle]}>
      <PremiumBall color={ballColor} size={ballSize} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  }
});

export default BallAnimator;
