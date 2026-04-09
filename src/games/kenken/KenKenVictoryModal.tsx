import React, { useMemo } from 'react';
import { Modal, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
import AppText from '../../components/AppText';

type Props = {
  visible: boolean;
  elapsedSeconds: number;
  levelId: number;
  hintsUsed: number;
  onReplay: () => void;
  onNextLevel: () => void;
  onHome: () => void;
};

const KenKenVictoryModalComponent = ({
  visible,
  elapsedSeconds,
  levelId,
  hintsUsed,
  onReplay,
  onNextLevel,
  onHome,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();

  const styles = useMemo(() => {
    return StyleSheet.create({
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      },
      card: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        width: screenWidth - 48,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 40,
        alignItems: 'center',
      },
      title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 0,
        color: '#00E5CC',
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 28,
      },
      statsRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 28,
        gap: 8,
      },
      stat: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        flex: 1,
        alignItems: 'center',
      },
      statLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
        marginBottom: 6,
      },
      statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
      },
      buttonsRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 0,
      },
      buttonReplay: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#2C2C2E',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonNext: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#39FF14',
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonTextReplay: {
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
      },
      buttonTextNext: {
        fontSize: 15,
        fontWeight: '700',
        color: '#39FF14',
      },
      homeButton: {
        marginTop: 16,
      },
      homeButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.35)',
      },
    });
  }, [screenWidth]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText style={styles.title}>COMPLETED</AppText>

          <AppText style={styles.subtitle}>Puzzle solved!</AppText>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <AppText style={styles.statLabel}>TIME</AppText>
              <AppText style={styles.statValue}>{formatTime(elapsedSeconds)}</AppText>
            </View>
            <View style={styles.stat}>
              <AppText style={styles.statLabel}>LEVEL</AppText>
              <AppText style={styles.statValue}>{levelId}</AppText>
            </View>
            <View style={styles.stat}>
              <AppText style={styles.statLabel}>HINTS</AppText>
              <AppText style={styles.statValue}>{hintsUsed}</AppText>
            </View>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={onReplay} style={styles.buttonReplay}>
              <AppText style={styles.buttonTextReplay}>REPLAY</AppText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={onNextLevel} style={styles.buttonNext}>
              <AppText style={styles.buttonTextNext}>NEXT LEVEL</AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={onHome} style={styles.homeButton}>
            <AppText style={styles.homeButtonText}>Back to Home</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const KenKenVictoryModal = React.memo(KenKenVictoryModalComponent);
