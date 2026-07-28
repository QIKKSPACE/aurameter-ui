import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Game2048State } from './Game2048Types';
import { GAME_2048_COLORS } from './Game2048Colors';

type Props = {
  gameState: Game2048State;
  onTryAgain: () => void;
  onKeepGoing?: () => void;
  onNewGame?: () => void;
  onCollectReward?: () => void;
  collectingReward?: boolean;
};

export default function Game2048Overlay({
  gameState,
  onTryAgain,
  onKeepGoing,
  onNewGame,
  onCollectReward,
  collectingReward = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(238, 228, 218, 0.73)',
        },
        overlayText: {
          fontSize: 40,
          fontWeight: '700',
          color: GAME_2048_COLORS.TITLE_COLOR,
          marginBottom: 20,
          textAlign: 'center',
        },
        overlayWinText: {
          color: GAME_2048_COLORS.SCORE_TEXT,
        },
        overlayButton: {
          backgroundColor: GAME_2048_COLORS.BUTTON_BG,
          borderRadius: 4,
          paddingHorizontal: 24,
          paddingVertical: 12,
          marginVertical: 8,
        },
        overlayButtonText: {
          color: GAME_2048_COLORS.BUTTON_TEXT,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        },
        rewardText: {
          color: GAME_2048_COLORS.TITLE_COLOR,
          fontSize: 16,
          fontWeight: '700',
          marginTop: 8,
          marginBottom: 4,
        },
      }),
    []
  );

  const isVisible = gameState.status === 'won' || gameState.status === 'lost';
  const isWon = gameState.status === 'won';

  return (
    <Modal
      visible={isVisible && gameState.status !== 'continuing'}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={[{ alignItems: 'center', paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={[styles.overlayText, isWon && styles.overlayWinText]}>
            {isWon ? 'YOU WIN!' : 'GAME OVER!'}
          </Text>

         

          {gameState.score > 0 && (
            <>
              <Text style={styles.rewardText}>REWARD READY: +{gameState.score} AURA</Text>
              {onCollectReward && (
                <TouchableOpacity
                  style={styles.overlayButton}
                  onPress={onCollectReward}
                  disabled={collectingReward}
                  activeOpacity={0.7}
                >
                  <Text style={styles.overlayButtonText}>
                    {collectingReward ? 'COLLECTING...' : 'COLLECT AURA'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {!isWon && (
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={onTryAgain}
              activeOpacity={0.7}
            >
              <Text style={styles.overlayButtonText}>TRY AGAIN</Text>
            </TouchableOpacity>
          )}

          {onNewGame && (
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={onNewGame}
              activeOpacity={0.7}
            >
              <Text style={styles.overlayButtonText}>NEW GAME</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
