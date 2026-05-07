import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MinesweeperGameState } from './MinesweeperTypes';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  gameState: MinesweeperGameState;
  elapsedSeconds: number;
  onRestart: () => void;
  onInfoPress: () => void;
  onGoBack?: () => void;
};

export default function MinesweeperHeader({
  gameState,
  elapsedSeconds,
  onRestart,
  onInfoPress,
  onGoBack,
}: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: MINESWEEPER_COLORS.HEADER_BG,
          borderRadius: 8,
          marginBottom: 16,
        },
        pill: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: MINESWEEPER_COLORS.MINE_COUNTER_BG,
          borderRadius: 16,
          minWidth: 80,
        },
        pillText: {
          fontSize: 22,
          fontWeight: '700',
          color: MINESWEEPER_COLORS.TEXT_COLOR,
          fontFamily: 'monospace',
          marginLeft: 6,
        },
        mineIcon: {
          fontSize: 14,
          color: MINESWEEPER_COLORS.MINE_COLOR,
        },
        restartButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: MINESWEEPER_COLORS.MINE_COUNTER_BG,
        },
        restartText: {
          fontSize: 24,
        },
        infoButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#2A2A2A',
          borderWidth: 1,
          borderColor: 'rgba(79,195,247,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        infoText: {
          fontSize: 16,
          fontWeight: '700',
          color: '#4FC3F7',
          fontStyle: 'italic',
        },
      }),
    []
  );

  const getSmiley = () => {
    if (gameState.status === 'idle' || gameState.status === 'playing') {
      return '😊';
    }
    if (gameState.status === 'lost') {
      return '😵';
    }
    if (gameState.status === 'won') {
      return '😎';
    }
    return '😊';
  };

  const formatNumber = (num: number) => String(num).padStart(3, '0');

  return (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onGoBack && (
          <TouchableOpacity
            onPress={onGoBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#2A2A2A',
              borderWidth: 1,
              borderColor: 'rgba(79,195,247,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="arrow-left" size={20} color="#4FC3F7" />
          </TouchableOpacity>
        )}
        <View style={styles.pill}>
          <Text style={styles.mineIcon}>💣</Text>
          <Text style={styles.pillText}>{formatNumber(Math.max(0, gameState.minesRemaining))}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.restartButton} onPress={onRestart} activeOpacity={0.7}>
        <Text style={styles.restartText}>{getSmiley()}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={styles.pill}>
          <Text style={{ fontSize: 14, color: MINESWEEPER_COLORS.TEXT_COLOR }}>⏱️</Text>
          <Text style={styles.pillText}>{formatNumber(elapsedSeconds)}</Text>
        </View>

        <TouchableOpacity style={styles.infoButton} onPress={onInfoPress} activeOpacity={0.7}>
          <Text style={styles.infoText}>i</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
