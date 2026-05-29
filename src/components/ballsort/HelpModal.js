import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HelpModal = ({ visible, onClose }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
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
        <View style={styles.header}>
          <Text style={styles.title}>How to Play</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.rule}>
          <Icon name="touch-app" size={24} color="#7aa2f7" />
          <Text style={styles.ruleText}>Tap any tube to pick up the top ball.</Text>
        </View>

        <View style={styles.rule}>
          <Icon name="arrow-downward" size={24} color="#7aa2f7" />
          <Text style={styles.ruleText}>Tap another tube to drop it in.</Text>
        </View>

        <View style={styles.rule}>
          <Icon name="rule" size={24} color="#7aa2f7" />
          <Text style={styles.ruleText}>You can only move a ball on top of another ball if they have the same color and the tube has space.</Text>
        </View>

        <View style={styles.rule}>
          <Icon name="emoji-events" size={24} color="#7aa2f7" />
          <Text style={styles.ruleText}>Win by sorting all colors so that each tube contains only one color!</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 600,
    padding: 20,
  },
  box: {
    backgroundColor: '#1f2335',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeBtn: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ruleText: {
    color: '#a9b1d6',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
    lineHeight: 24,
  }
});

export default React.memo(HelpModal);
