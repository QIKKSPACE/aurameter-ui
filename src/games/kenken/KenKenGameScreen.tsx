import React, { useCallback, useMemo } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../../components/ScreenBackground';
import AppText from '../../components/AppText';
import { useTheme } from '../../constants/context/ThemeContext';
import { useKenKen } from './useKenKen';
import { KenKenBoard } from './KenKenBoard';
import { KenKenHeader } from './KenKenHeader';
import { KenKenActionBar } from './KenKenActionBar';
import { KenKenNumberPad } from './KenKenNumberPad';
import { KenKenVictoryModal } from './KenKenVictoryModal';
import { KENKEN_COLORS, getDifficultyColor } from './KenKenColors';
import { createKenKenStyles } from './KenKenStyles';

type Props = {
  navigation: {
    goBack: () => void;
  };
  levelId?: number;
};

export const KenKenGameScreen = ({ navigation, levelId = 1 }: Props) => {
  const insets = useSafeAreaInsets();
  const {
    gameState,
    elapsedSeconds,
    hintsUsed,
    isCompleted,
    handleCellPress,
    handleNumberInput,
    handleDelete,
    handleHint,
    handleUndo,
    handleRedo,
    handleClear,
    handleTogglePencil,
    handleReset,
    handleNextLevel,
  } = useKenKen(levelId);

  const { width } = useWindowDimensions();
  const styles = useMemo(() => createKenKenStyles(gameState?.level.gridSize || 4, width), [gameState?.level.gridSize, width]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleHomePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNextLevelPress = useCallback(() => {
    handleNextLevel();
  }, [handleNextLevel]);

  if (!gameState) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText style={{ fontSize: 16, color: '#FFFFFF' }}>Loading...</AppText>
        </View>
      </ScreenBackground>
    );
  }

  const difficultyColors = getDifficultyColor(gameState.level.difficulty);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KenKenHeader elapsedSeconds={elapsedSeconds} onBack={handleBackPress} />

        <View style={{ alignSelf: 'center', marginTop: 8, marginBottom: 8 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              backgroundColor: difficultyColors.bg,
            }}
          >
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: difficultyColors.text,
                textAlign: 'center',
              }}
            >
              {gameState.level.difficulty.toUpperCase()}
            </AppText>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16 }}
          scrollEnabled={false}
        >
          <View style={{ alignItems: 'center' }}>
            <KenKenBoard
              level={gameState.level}
              grid={gameState.grid}
              selectedCell={gameState.selectedCell}
              onCellPress={handleCellPress}
              screenWidth={width}
            />
          </View>
        </ScrollView>

        <KenKenActionBar
          onUndo={handleUndo}
          onPencil={handleTogglePencil}
          onClear={handleClear}
          onRedo={handleRedo}
          isPencilMode={gameState.isPencilMode}
        />

        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <KenKenNumberPad gridSize={gameState.level.gridSize} onNumberPress={handleNumberInput} />
        </View>

        <KenKenVictoryModal
          visible={isCompleted}
          elapsedSeconds={elapsedSeconds}
          levelId={gameState.level.id}
          hintsUsed={hintsUsed}
          onReplay={handleReset}
          onNextLevel={handleNextLevelPress}
          onHome={handleHomePress}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
};
