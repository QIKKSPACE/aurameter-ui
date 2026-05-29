import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { ScrollView, View, useWindowDimensions, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../../components/ScreenBackground';
import AppText from '../../components/AppText';
import { useTheme } from '../../constants/context/ThemeContext';
import { useKenKen } from './useKenKen';
import { KenKenBoard } from './KenKenBoard';
import { KenKenHeader } from './KenKenHeader';
import { KenKenActionBar } from './KenKenActionBar';
import { KenKenNumberPad } from './KenKenNumberPad';
import { KenKenVictoryModal } from './KenKenVictoryModal';
import { KenKenHowToPlay } from './KenKenHowToPlay';
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
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const {
    gameState,
    elapsedSeconds,
    hintsUsed,
    isCompleted,
    hintMessage,
    highlightedCells,
    hintCellFlash,
    handleCellPress,
    handleNumberInput,
    handleDelete,
    handleHint,
    handleUndo,
    handleRedo,
    handleClear,
    handleReset,
    handleNextLevel,
  } = useKenKen(levelId);

  const { width } = useWindowDimensions();
  const styles = useMemo(() => createKenKenStyles(gameState?.level.gridSize || 4, width), [gameState?.level.gridSize, width]);

  useEffect(() => {
    const checkHowToPlay = async () => {
      try {
        const seen = await AsyncStorage.getItem('@aurameter/kenken-howtoplay-seen');
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
      await AsyncStorage.setItem('@aurameter/kenken-howtoplay-seen', 'true');
    } catch (_) {
      // ignore
    }
    setShowHowToPlay(false);
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleInfoPress = useCallback(() => {
    setShowInfo(true);
  }, []);

  const handleInfoClose = useCallback(() => {
    setShowInfo(false);
  }, []);

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
        <KenKenHeader elapsedSeconds={elapsedSeconds} onBack={handleBackPress} onInfo={handleInfoPress} />

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
              highlightedCells={highlightedCells}
              hintCellFlash={hintCellFlash}
            />
          </View>
        </ScrollView>

        {hintMessage && (
          <View
            style={{
              backgroundColor: '#2C2C2E',
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 24,
              marginVertical: 8,
            }}
          >
            <AppText style={{ color: '#FFFFFF', fontSize: 13, textAlign: 'center' }}>
              {hintMessage}
            </AppText>
          </View>
        )}

        <KenKenActionBar
          onUndo={handleUndo}
          onClear={handleClear}
          onRedo={handleRedo}
          onHint={handleHint}
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

        {showHowToPlay && <KenKenHowToPlay onContinue={handleHowToPlayContinue} />}

        <Modal visible={showInfo} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.85)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}
          >
            <ScrollView
              style={{ maxHeight: '80%' }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  backgroundColor: '#1C1C1E',
                  borderRadius: 20,
                  padding: 24,
                  width: width - 48,
                }}
              >
                <AppText style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 20 }}>
                  How to Play KenKen
                </AppText>

                <View style={{ marginBottom: 24 }}>
                  {[
                    {
                      title: 'Fill the Grid',
                      description:
                        'Place numbers 1 to N in every row and column. N is the grid size (3 for 3×3, 4 for 4×4, etc.)',
                    },
                    {
                      title: 'No Repeats',
                      description: 'No number can appear twice in the same row or in the same column.',
                    },
                    {
                      title: 'Cage Clues',
                      description:
                        'Each outlined cage shows a target and operation. The numbers inside must produce that target.',
                    },
                    {
                      title: 'Operations',
                      description:
                        "'+' = add all,  '-' = subtract (2 cells only), '×' = multiply all,  '÷' = divide (2 cells only). A lone number means that cell equals that value.",
                    },
                    {
                      title: 'Tap to Enter',
                      description:
                        'Tap a cell to select it, then tap a number from the pad below. Use pencil mode for notes.',
                    },
                  ].map((rule, index) => (
                    <View key={index.toString()} style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#8B8FE8',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                          marginTop: 2,
                        }}
                      >
                        <AppText style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
                          {index + 1}
                        </AppText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>
                          {rule.title}
                        </AppText>
                        <AppText
                          style={{ fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.65)', lineHeight: 19 }}
                        >
                          {rule.description}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleInfoClose}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: '#8B8FE8',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <AppText style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Got it!</AppText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenBackground>
  );
};
