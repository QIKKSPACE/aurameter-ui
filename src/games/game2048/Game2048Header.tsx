import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game2048State } from './Game2048Types';
import { GAME_2048_COLORS } from './Game2048Colors';

type Props = {
  gameState: Game2048State;
  onNewGame: () => void;
};

export default function Game2048Header({ gameState, onNewGame }: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingVertical: 20,
          paddingHorizontal: 12,
        },
        title: {
          fontSize: 48,
          fontWeight: '800',
          color: GAME_2048_COLORS.TITLE_COLOR,
        },
        scoreSection: {
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-end',
        },
        scoreBoxRow: {
          flexDirection: 'row',
          gap: 12,
        },
        scoreBox: {
          backgroundColor: GAME_2048_COLORS.SCORE_BG,
          borderRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 8,
          alignItems: 'center',
          minWidth: 80,
        },
        scoreLabel: {
          fontSize: 10,
          color: GAME_2048_COLORS.SCORE_LABEL,
          fontWeight: '600',
        },
        scoreValue: {
          fontSize: 24,
          fontWeight: '700',
          color: GAME_2048_COLORS.SCORE_TEXT,
          marginTop: 4,
        },
        newGameButton: {
          backgroundColor: GAME_2048_COLORS.BUTTON_BG,
          borderRadius: 4,
          paddingHorizontal: 14,
          paddingVertical: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        newGameButtonText: {
          color: GAME_2048_COLORS.BUTTON_TEXT,
          fontSize: 12,
          fontWeight: '600',
        },
      }),
    []
  );

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>2048</Text>

      <View style={styles.scoreSection}>
        <View style={styles.scoreBoxRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{gameState.score}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{gameState.bestScore}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newGameButton}
          onPress={onNewGame}
          activeOpacity={0.7}
        >
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
