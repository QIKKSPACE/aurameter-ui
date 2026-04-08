import React, { useMemo } from 'react';
import { View, SafeAreaView } from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import { useTheme } from '../../constants/context/ThemeContext';
import { useGame2048 } from './useGame2048';
import Game2048Header from './Game2048Header';
import Game2048Board from './Game2048Board';
import Game2048Overlay from './Game2048Overlay';
import { GAME_2048_COLORS } from './Game2048Colors';

type Props = {
  navigation?: {
    goBack: () => void;
  };
};

export default function Game2048Screen({ navigation }: Props) {
  const { theme } = useTheme();
  const { gameState, handleSwipe, handleNewGame, handleKeepGoing } = useGame2048();

  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: GAME_2048_COLORS.SCREEN_BG,
    }),
    []
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: GAME_2048_COLORS.SCREEN_BG }}>
        <View style={containerStyle}>
          <Game2048Header gameState={gameState} onNewGame={handleNewGame} />

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
            <Game2048Board gameState={gameState} onSwipe={handleSwipe} />
          </View>

          <Game2048Overlay
            gameState={gameState}
            onTryAgain={handleNewGame}
            onKeepGoing={handleKeepGoing}
            onNewGame={handleNewGame}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
