import React, { useMemo } from 'react';
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/AppText';
import { KENKEN_COLORS } from './KenKenColors';

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
  const styles = useMemo(() => {
    return StyleSheet.create({
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      },
      card: {
        width: '80%',
        backgroundColor: KENKEN_COLORS.VICTORY_CARD_BG,
        borderRadius: 16,
        padding: 24,
        maxWidth: 350,
        alignItems: 'center',
      },
      cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
      },
      cardButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
        justifyContent: 'center',
        alignItems: 'center',
      },
      titleGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 16,
      },
      title: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        color: KENKEN_COLORS.VICTORY_TITLE_COLOR_START,
      },
      statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
        gap: 8,
      },
      stat: {
        backgroundColor: KENKEN_COLORS.SCORE_BADGE_BG,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        flex: 1,
      },
      statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
      },
      statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: KENKEN_COLORS.SCORE_TEXT,
      },
      buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
      },
      button: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
      },
      buttonPrimary: {
        borderWidth: 2,
        borderColor: KENKEN_COLORS.VICTORY_NEW_GAME_BORDER,
      },
      buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
      },
      buttonTextPrimary: {
        color: KENKEN_COLORS.VICTORY_NEW_GAME_BORDER,
      },
    });
  }, []);

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
          <View style={styles.cardTop}>
            <TouchableOpacity activeOpacity={0.7} onPress={onHome} style={styles.cardButton}>
              <Icon name="home" size={20} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
            </TouchableOpacity>
            <View style={{ width: 44 }} />
          </View>

          <LinearGradient
            colors={[KENKEN_COLORS.VICTORY_TITLE_COLOR_START, KENKEN_COLORS.VICTORY_TITLE_COLOR_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <AppText style={styles.title}>COMPLETE</AppText>
          </LinearGradient>

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
            <TouchableOpacity activeOpacity={0.7} onPress={onReplay} style={styles.button}>
              <AppText style={styles.buttonText}>REPLAY</AppText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={onNextLevel} style={[styles.button, styles.buttonPrimary]}>
              <AppText style={[styles.buttonText, styles.buttonTextPrimary]}>NEXT LEVEL</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const KenKenVictoryModal = React.memo(KenKenVictoryModalComponent);
