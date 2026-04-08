import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MinesweeperGameState, DIFFICULTY_CONFIGS } from './MinesweeperTypes';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  gameState: MinesweeperGameState;
  elapsedSeconds: number;
  onTryAgain: () => void;
  onNewGame: () => void;
};

export default function MinesweeperOverlay({
  gameState,
  elapsedSeconds,
  onTryAgain,
  onNewGame,
}: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        card: {
          backgroundColor: '#2A2A2A',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          minWidth: '70%',
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          marginBottom: 16,
        },
        text: {
          fontSize: 16,
          color: MINESWEEPER_COLORS.TEXT_COLOR,
          marginBottom: 8,
        },
        buttonsContainer: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 20,
          width: '100%',
        },
        button: {
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          borderWidth: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        buttonText: {
          fontSize: 14,
          fontWeight: '600',
          color: MINESWEEPER_COLORS.TEXT_COLOR,
        },
      }),
    []
  );

  const isVisible = gameState.status === 'won' || gameState.status === 'lost';
  const isWon = gameState.status === 'won';
  const accentColor = isWon
    ? MINESWEEPER_COLORS.VICTORY_ACCENT
    : MINESWEEPER_COLORS.DEFEAT_ACCENT;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[styles.title, { color: accentColor }]}>
            {isWon ? 'YOU WIN!' : 'GAME OVER'}
          </Text>

          <Text style={styles.text}>Time: {formatTime(elapsedSeconds)}</Text>
          <Text style={styles.text}>Mines: {DIFFICULTY_CONFIGS[gameState.difficulty].mines}</Text>

          {isWon && (
            <Text style={[styles.text, { color: accentColor }]}>
              Flags: {DIFFICULTY_CONFIGS[gameState.difficulty].mines - gameState.minesRemaining}
            </Text>
          )}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderColor: accentColor,
                },
              ]}
              onPress={onTryAgain}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{isWon ? 'PLAY AGAIN' : 'TRY AGAIN'}</Text>
            </TouchableOpacity>

            {isWon && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
                  },
                ]}
                onPress={onNewGame}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>NEW GAME</Text>
              </TouchableOpacity>
            )}

            {!isWon && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
                  },
                ]}
                onPress={onNewGame}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>NEW GAME</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
