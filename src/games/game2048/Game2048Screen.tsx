import React, { useCallback, useMemo, useState } from 'react';
import { View, SafeAreaView, Modal, Text, TouchableOpacity, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenBackground from '../../components/ScreenBackground';
import { useGame2048 } from './useGame2048';
import Game2048Header from './Game2048Header';
import Game2048Board from './Game2048Board';
import Game2048Overlay from './Game2048Overlay';
import { GAME_2048_COLORS } from './Game2048Colors';
import api from '../../services/api';
import { useToast } from '../../constants/context/ErrorContext';
import { updateUserData } from '../../store/userSlice';

type Props = {
  navigation?: {
    goBack: () => void;
  };
};

const HowToPlayRule = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8F7A66',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>{number}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#776E65', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: '#9F8F82', lineHeight: 18 }}>{description}</Text>
    </View>
  </View>
);

export default function Game2048Screen({ navigation }: Props) {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const user = useSelector((state: any) => state.user);
  const [collectingReward, setCollectingReward] = useState(false);
  const {
    gameState,
    handleSwipe,
    handleNewGame,
    handleKeepGoing,
    handleCollectReward: clearReward,
  } = useGame2048();
  const [showInfo, setShowInfo] = useState(false);
  const rewardScore = gameState.score;

  const handleCollectReward = useCallback(async () => {
    if (collectingReward || rewardScore <= 0) {
      if (rewardScore <= 0) {
        showToast('No Aura to claim! Reach higher tiles to earn Aura.', 'failure');
      }
      return;
    }

    try {
      setCollectingReward(true);
      const response = await api.post('/game/2048-game', {
        aura: rewardScore,
      });

      if (response?.data?.success) {
        clearReward();
        dispatch(
          updateUserData({
            aura: (user?.userData?.aura || 0) + rewardScore,
          })
        );
        showToast(`You claimed ${rewardScore} Aura.`, 'success');
      }
    } catch (err: any) {
      console.log('Claim reward error:', err?.response?.data || err.message);
      showToast('Failed to Claim Aura, Try again', 'error');
    } finally {
      setCollectingReward(false);
    }
  }, [
    collectingReward,
    clearReward,
    dispatch,
    rewardScore,
    showToast,
    user?.userData?.aura,
  ]);

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
          <Game2048Header gameState={gameState} onNewGame={handleNewGame} onInfoPress={() => setShowInfo(true)} onGoBack={navigation?.goBack} />

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
            <Game2048Board gameState={gameState} onSwipe={handleSwipe} />
          </View>

          {rewardScore > 0 && (
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 12,
                padding: 14,
                borderRadius: 16,
                backgroundColor: '#BBADA0',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 6 }}>
                Total Aura Earned: {rewardScore}
              </Text>
              <Text style={{ color: '#F9F6F2', fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
                Reward Ready: +{rewardScore} AURA
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={collectingReward}
                onPress={handleCollectReward}
                style={{
                  backgroundColor: collectingReward ? '#94A3B8' : '#22C55E',
                  paddingHorizontal: 22,
                  paddingVertical: 12,
                  borderRadius: 24,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {collectingReward ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : null}
                <Text style={{ fontWeight: '700', color: '#000' }}>
                  {collectingReward ? 'COLLECTING...' : 'COLLECT AURA'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Game2048Overlay
            gameState={gameState}
            onTryAgain={handleNewGame}
            onKeepGoing={handleKeepGoing}
            onNewGame={handleNewGame}
            onCollectReward={handleCollectReward}
            collectingReward={collectingReward}
          />
        </View>
      </SafeAreaView>

      <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(119,110,101,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FAF8EF',
              borderRadius: 16,
              width: screenWidth - 48,
              padding: 24,
              maxHeight: '80%',
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#776E65', marginBottom: 20 }}>How to Play 2048</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <HowToPlayRule
                number={1}
                title="Swipe to Move"
                description="Swipe up, down, left, or right. All tiles on the board slide in that direction at once."
              />
              <HowToPlayRule
                number={2}
                title="Merge Same Numbers"
                description="When two tiles with the same number collide, they merge into one tile with double the value."
              />
              <HowToPlayRule
                number={3}
                title="Score Points"
                description="Each merge adds the new tile's value to your score. Aura tiers unlock as you reach 32 (1), 64 (2), 128 (4), 256 (6), 512 (8), 1024 (9), and 2048 (10)."
              />
              <HowToPlayRule
                number={4}
                title="Reach 2048"
                description="Create a tile with the number 2048 to win! You can keep playing after to reach higher."
              />
              <HowToPlayRule
                number={5}
                title="Earn Aura"
                description="Earn Aura by reaching high tiles: 32 (1), 64 (2), 128 (4), 256 (6), 512 (8), 1024 (9), 2048 (10). Aura accumulates across games until claimed!"
              />
              <HowToPlayRule
                number={6}
                title="Game Over"
                description="The game ends when no more moves are possible — the board is full with no adjacent matches."
              />
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: '#8F7A66',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: 'center',
                marginTop: 20,
              }}
              onPress={() => setShowInfo(false)}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}
