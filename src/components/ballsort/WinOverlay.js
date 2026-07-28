import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';

const WinOverlay = ({
  visible,
  onNextLevel,
  claimReward,
  rewardAmount = 0,
  claimDisabled = false,
  claimLabel,
}) => {
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
    transform: [{ scale: scale.value }]
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.box, boxStyle]}>
        <Text style={styles.title}>🎉 Level Complete! 🎉</Text>
        <Text style={styles.subtitle}>Great job sorting all the colors.</Text>
        
        <TouchableOpacity style={styles.button} onPress={onNextLevel} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Play Next Level</Text>
        </TouchableOpacity>

         <TouchableOpacity
           style={[styles.claimButton, claimDisabled && styles.claimButtonDisabled]}
           onPress={claimReward}
           activeOpacity={0.8}
           disabled={claimDisabled}
         >
          <Text style={styles.buttonText}>
            {claimLabel || (rewardAmount > 0 ? `Claim ${rewardAmount} Aura` : "Claim Reward")}
          </Text>
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
    borderColor: '#7aa2f7',
    shadowColor: '#7aa2f7',
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
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#7aa2f7',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  claimButton: {
    backgroundColor: '#50fa7b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 15,
  },
  claimButtonDisabled: {
    backgroundColor: 'rgba(80,250,123,0.35)',
  },
  buttonText: {
    color: '#1a1b26',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default React.memo(WinOverlay);
