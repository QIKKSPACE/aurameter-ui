import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const GameOverOverlay = ({ visible, onReplay, remainingMoves, moveLimit }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.5, { duration: 200 });
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.box, boxStyle]}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.subtitle}>
          You ran out of moves for this level.
        </Text>
        <Text style={styles.movesText}>
          Moves left: {remainingMoves}/{moveLimit}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onReplay} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Replay Level</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
  },
  box: {
    backgroundColor: '#24283b',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f7768e',
    shadowColor: '#f7768e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a9b1d6',
    marginBottom: 10,
    textAlign: 'center',
  },
  movesText: {
    fontSize: 14,
    color: '#f0f0f0',
    marginBottom: 24,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#f7768e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#1a1b26',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default React.memo(GameOverOverlay);
