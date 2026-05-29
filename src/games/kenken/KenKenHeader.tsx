import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/AppText';
import { KENKEN_COLORS } from './KenKenColors';

type Props = {
  elapsedSeconds: number;
  onBack: () => void;
  onInfo: () => void;
};

const KenKenHeaderComponent = ({ elapsedSeconds, onBack, onInfo }: Props) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,143,232,0.1)',
      },
      backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
      },
      rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      timerPill: {
        backgroundColor: KENKEN_COLORS.TIMER_BACKGROUND,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      timerText: {
        fontSize: 16,
        fontWeight: '600',
        color: KENKEN_COLORS.TIMER_TEXT_COLOR,
      },
      infoButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2C2C2E',
        borderWidth: 1,
        borderColor: 'rgba(139,143,232,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      infoText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B8FE8',
        fontStyle: 'italic',
      },
    });
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
      </TouchableOpacity>

      <AppText style={styles.title}>KenKen</AppText>

      <View style={styles.rightSection}>
        <View style={styles.timerPill}>
          <Icon name="clock" size={14} color={KENKEN_COLORS.TIMER_ICON_COLOR} />
          <AppText style={styles.timerText}>{formatTime(elapsedSeconds)}</AppText>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={onInfo} style={styles.infoButton}>
          <AppText style={styles.infoText}>i</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const KenKenHeader = React.memo(KenKenHeaderComponent);
