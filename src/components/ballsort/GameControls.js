import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GameHaptics } from '../../utils/haptics';
import { useNavigation } from '@react-navigation/native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ControlButton = ({ icon, onPress, disabled }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (disabled) return;
    GameHaptics.buttonPress();
    onPress();
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.button, animatedStyle, disabled && styles.buttonDisabled]}
    >
      <Icon name={icon} size={22} color={disabled ? '#888' : '#FFF'} />
    </AnimatedTouchable>
  );
};

const GameControls = ({ level, movesUsed, moveLimit, onUndo, onRestart, onHint, onHelp, theme }) => {
  const navigation = useNavigation();
  const movesRemaining = Math.max(moveLimit - movesUsed, 0);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <ControlButton icon="arrow-back" onPress={() => navigation.goBack()} />
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.movesText}>Moves {movesRemaining}/{moveLimit}</Text>
      </View>
      
      <View style={styles.actions}>
        <ControlButton icon="help-outline" onPress={onHelp} />
        <View style={{ width: 8 }} />
        <View style={{ width: 8 }} />
        <ControlButton icon="undo" onPress={onUndo} />
        <View style={{ width: 8 }} />
        <ControlButton icon="refresh" onPress={onRestart} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    width: '100%'
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  movesText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#a9b1d6',
  },
  actions: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  }
});

export default React.memo(GameControls);
