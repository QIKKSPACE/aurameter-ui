import React, { useMemo, useState } from 'react';
import { View, SafeAreaView, Modal, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
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
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { gameState, handleSwipe, handleNewGame, handleKeepGoing } = useGame2048();
  const [showInfo, setShowInfo] = useState(false);

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

          <Game2048Overlay
            gameState={gameState}
            onTryAgain={handleNewGame}
            onKeepGoing={handleKeepGoing}
            onNewGame={handleNewGame}
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
                description="Each merge adds the new tile's value to your score. Aim for the highest score possible."
              />
              <HowToPlayRule
                number={4}
                title="Reach 2048"
                description="Create a tile with the number 2048 to win! You can keep playing after to reach higher."
              />
              <HowToPlayRule
                number={5}
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
