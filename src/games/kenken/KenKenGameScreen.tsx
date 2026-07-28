import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import ScreenBackground from '../../components/ScreenBackground';
import AppText from '../../components/AppText';
import { useKenKen } from './useKenKen';
import { KenKenBoard } from './KenKenBoard';
import { KenKenHeader } from './KenKenHeader';
import { KenKenActionBar } from './KenKenActionBar';
import { KenKenNumberPad } from './KenKenNumberPad';
import { KenKenVictoryModal } from './KenKenVictoryModal';
import { KenKenHowToPlay } from './KenKenHowToPlay';
import { getDifficultyColor } from './KenKenColors';
import api from '../../services/api';
import { useToast } from '../../constants/context/ErrorContext';
import { updateUserData } from '../../store/userSlice';

type Props = {
  navigation: {
    goBack: () => void;
  };
  levelId?: number;
};

export const KenKenGameScreen = ({ navigation, levelId }: Props) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const previousLevelIdRef = useRef<number | null>(null);
  const previousCompletedRef = useRef(false);
  const { showToast } = useToast();
  const user = useSelector((state: any) => state.user);
  const {
    gameState,
    elapsedSeconds,
    hintsUsed,
    totalScore,
    pendingReward,
    hintMessage,
    highlightedCells,
    hintCellFlash,
    handleCellPress,
    handleNumberInput,
    handleHint,
    handleUndo,
    handleRedo,
    handleClear,
    handleReset,
    handleNextLevel,
    handleCollectReward,
  } = useKenKen(levelId);

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!gameState) return;

    if (previousLevelIdRef.current !== gameState.level.id) {
      previousLevelIdRef.current = gameState.level.id;
      previousCompletedRef.current = gameState.isCompleted;
      setShowVictoryModal(false);
      return;
    }

    if (gameState.isCompleted && !previousCompletedRef.current) {
      setShowVictoryModal(true);
    }

    if (!gameState.isCompleted) {
      setShowVictoryModal(false);
    }

    previousCompletedRef.current = gameState.isCompleted;
  }, [gameState]);

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

  const handleCollectRewardPress = useCallback(async () => {
    if (claimingReward) return;
    if (pendingReward <= 0) {
      showToast('No Points,Complete more levels to earn points!', 'failure');
      return;
    }

    setClaimingReward(true);

    try {
      const response = await api.post('/game/ken-ken-game', {
        level: gameState.level.id,
        aura: pendingReward,
      });

      if (response?.data?.success) {
        dispatch(
          updateUserData({
            aura: (user?.userData?.aura || 0) + pendingReward,
          })
        );
        handleCollectReward();
        showToast(`You claimed ${pendingReward} points.`, 'success');
      }
    } catch (err) {
      console.error('Claim reward error:', err?.response?.data || err.message);
      showToast('Failed to Claim  Aura, Try again', 'error');
    } finally {
      setClaimingReward(false);
    }
  }, [claimingReward, dispatch, gameState?.level?.id, handleCollectReward, pendingReward, showToast, user?.userData?.aura]);

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

        <View
          style={{
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 8,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
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
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              backgroundColor: '#2C2C2E',
            }}
          >
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: '#FFFFFF',
                textAlign: 'center',
              }}
            >
              SCORE {pendingReward}
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

    {pendingReward > 0 && (
          <View
            style={{
              marginHorizontal: 24,
              marginBottom: 8,
              borderRadius: 14,
              padding: 12,
              backgroundColor: '#1C1C1E',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCollectRewardPress}
              disabled={pendingReward <= 0 || claimingReward}
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: pendingReward > 0 && !claimingReward ? '#F5C542' : '#2C2C2E',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: claimingReward ? 0.7 : 1,
              }}
            >
              <AppText
                style={{
                  color: pendingReward > 0 ? '#111111' : 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  fontWeight: '800',
                }}
              >
                {claimingReward ? 'COLLECTING...' : pendingReward > 0 ? 'COLLECT REWARD' : 'REWARD COLLECTED'}
              </AppText>
            </TouchableOpacity>
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
          visible={showVictoryModal}
          elapsedSeconds={elapsedSeconds}
          levelId={gameState.level.id}
          score={totalScore}
          hintsUsed={hintsUsed}
          onReplay={() => {
            setShowVictoryModal(false);
            handleReset();
          }}
          onNextLevel={() => {
            setShowVictoryModal(false);
            handleNextLevelPress();
          }}
          onHome={() => {
            setShowVictoryModal(false);
            handleHomePress();
          }}
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
