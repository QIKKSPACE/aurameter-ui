import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, SafeAreaView, useWindowDimensions, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

const MINESWEEPER_RULES = [
  {
    title: 'Tap to Reveal',
    description:
      'Tap any unrevealed cell to open it. Your very ' +
      'first tap is always safe — no mine will be there.',
  },
  {
    title: 'Read the Numbers',
    description:
      'A revealed number tells you exactly how many ' +
      'of its 8 surrounding cells contain mines.',
  },
  {
    title: 'Flag a Mine',
    description:
      'Long-press any unrevealed cell to place a red ' +
      'flag. Long-press the flag again to remove it.',
  },
  {
    title: 'Win Condition',
    description:
      'Reveal every safe cell to win. You do not need ' +
      'to flag all mines — just uncover everything ' +
      'that is not a mine.',
  },
  {
    title: 'Difficulty Levels',
    description:
      'Beginner (9×9, 10 mines) up to Huge (20×24, ' +
      '130 mines). Larger grids and more mines = harder.',
  },
];

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
  const [showInfo, setShowInfo] = useState(false);
  const {
    gameState,
    elapsedSeconds,
    handleCellTap,
    handleCellLongPress,
    handleRestart,
    handleChangeDifficulty,
    handleTryAgain,
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
            onInfoPress={() => setShowInfo(true)}
            onGoBack={navigation?.goBack}
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
            onTryAgain={handleTryAgain}
            onNewGame={handleRestart}
          />
        </View>

        {showHowToPlay && <MinesweeperHowToPlay onContinue={handleHowToPlayContinue} />}

        {/* How to Play Modal - triggered by info button */}
        {showInfo && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.88)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: '#1C1C1E',
                borderRadius: 20,
                width: '100%',
                maxHeight: '80%',
                padding: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginBottom: 20,
                }}
              >
                How to Play
              </Text>

              <ScrollView
                style={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
              >
                {MINESWEEPER_RULES.map((rule, index) => (
                  <View key={index}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: '#4FC3F7',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            color: '#0D0D0D',
                            fontWeight: '700',
                            fontSize: 13,
                          }}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: 15,
                            marginBottom: 4,
                          }}
                        >
                          {rule.title}
                        </Text>
                        <Text
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 13,
                            lineHeight: 19,
                          }}
                        >
                          {rule.description}
                        </Text>
                      </View>
                    </View>
                    {index < MINESWEEPER_RULES.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          marginBottom: 16,
                        }}
                      />
                    )}
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowInfo(false)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#4FC3F7',
                  borderRadius: 12,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    color: '#0D0D0D',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  Got it!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}
