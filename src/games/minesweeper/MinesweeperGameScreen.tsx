import React, { useMemo } from 'react';
import { View, SafeAreaView, useWindowDimensions } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import { useTheme } from '../../constants/context/ThemeContext';
import { Difficulty } from './MinesweeperTypes';
import { useMinesweeper } from './useMinesweeper';
import MinesweeperHeader from './MinesweeperHeader';
import MinesweeperBoard from './MinesweeperBoard';
import MinesweeperDifficultyBar from './MinesweeperDifficultyBar';
import MinesweeperOverlay from './MinesweeperOverlay';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  navigation?: {
    goBack: () => void;
  };
  initialDifficulty?: Difficulty;
};

export default function MinesweeperGameScreen({
  navigation,
  initialDifficulty = 'beginner',
}: Props) {
  const { theme } = useTheme();
  const {
    gameState,
    elapsedSeconds,
    handleCellTap,
    handleCellLongPress,
    handleRestart,
    handleChangeDifficulty,
  } = useMinesweeper(initialDifficulty);

  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: MINESWEEPER_COLORS.SCREEN_BG,
      paddingHorizontal: 16,
    }),
    []
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: MINESWEEPER_COLORS.SCREEN_BG }}>
        <View style={containerStyle}>
          <MinesweeperHeader
            gameState={gameState}
            elapsedSeconds={elapsedSeconds}
            onRestart={handleRestart}
          />

          <MinesweeperDifficultyBar
            currentDifficulty={gameState.difficulty}
            onDifficultyChange={handleChangeDifficulty}
          />

          <View style={{ flex: 1 }}>
            <MinesweeperBoard
              gameState={gameState}
              onCellTap={handleCellTap}
              onCellLongPress={handleCellLongPress}
            />
          </View>

          <MinesweeperOverlay
            gameState={gameState}
            elapsedSeconds={elapsedSeconds}
            onTryAgain={handleRestart}
            onNewGame={handleRestart}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
