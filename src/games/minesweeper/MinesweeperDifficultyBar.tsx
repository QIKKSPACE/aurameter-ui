import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Difficulty, DIFFICULTY_CONFIGS } from './MinesweeperTypes';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
};

const difficulties: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'huge'];

export default function MinesweeperDifficultyBar({
  currentDifficulty,
  onDifficultyChange,
}: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 12,
          paddingHorizontal: 8,
          backgroundColor: MINESWEEPER_COLORS.HEADER_BG,
          borderRadius: 8,
          marginBottom: 16,
        },
        button: {
          paddingVertical: 8,
          paddingHorizontal: 10,
        },
        buttonActive: {
          borderBottomWidth: 2,
          borderBottomColor: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
        },
        text: {
          fontSize: 13,
          fontWeight: '600',
        },
        textInactive: {
          color: MINESWEEPER_COLORS.DIFFICULTY_INACTIVE,
        },
        textActive: {
          color: MINESWEEPER_COLORS.DIFFICULTY_ACTIVE,
        },
      }),
    []
  );

  const formatLabel = (d: Difficulty) => d.charAt(0).toUpperCase() + d.slice(1);

  return (
    <View style={styles.container}>
      {difficulties.map((difficulty) => {
        const isActive = difficulty === currentDifficulty;
        const config = DIFFICULTY_CONFIGS[difficulty];

        return (
          <TouchableOpacity
            key={difficulty}
            style={[styles.button, isActive && styles.buttonActive]}
            onPress={() => onDifficultyChange(difficulty)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                isActive ? styles.textActive : styles.textInactive,
              ]}
            >
              {formatLabel(difficulty)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
