import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, SafeAreaView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../../components/ScreenBackground';
import { useTheme } from '../../constants/context/ThemeContext';
import { Difficulty } from './MinesweeperTypes';
import { useMinesweeper } from './useMinesweeper';
import MinesweeperHeader from './MinesweeperHeader';
import MinesweeperBoard from './MinesweeperBoard';
import MinesweeperDifficultyBar from './MinesweeperDifficultyBar';
import MinesweeperOverlay from './MinesweeperOverlay';
import { MinesweeperHowToPlay } from './MinesweeperHowToPlay';
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
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const {
    gameState,
    elapsedSeconds,
    handleCellTap,
    handleCellLongPress,
    handleRestart,
    handleChangeDifficulty,
  } = useMinesweeper(initialDifficulty);

  useEffect(() => {
    const checkHowToPlay = async () => {
      try {
        const seen = await AsyncStorage.getItem('@aurameter/minesweeper-howtoplay-seen');
        if (!seen) {
          setShowHowToPlay(true);
        }
      } catch (_) {
        // ignore
      }
    };

    checkHowToPlay();
  }, []);

  const handleHowToPlayContinue = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@aurameter/minesweeper-howtoplay-seen', 'true');
    } catch (_) {
      // ignore
    }
    setShowHowToPlay(false);
  }, []);

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
        <View style={[containerStyle, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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

        {showHowToPlay && <MinesweeperHowToPlay onContinue={handleHowToPlayContinue} />}
      </SafeAreaView>
    </ScreenBackground>
  );
}
