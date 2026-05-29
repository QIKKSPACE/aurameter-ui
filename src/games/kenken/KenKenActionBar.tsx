import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../components/AppText';
import { KENKEN_COLORS, KENKEN_SIZING } from './KenKenColors';

type Props = {
  onUndo: () => void;
  onClear: () => void;
  onRedo: () => void;
  onHint: () => void;
};

const KenKenActionBarComponent = ({ onUndo, onClear, onRedo, onHint }: Props) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: KENKEN_SIZING.ACTION_BAR_SPACING,
        marginBottom: KENKEN_SIZING.ACTION_BAR_MARGIN_BOTTOM,
        backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
      },
      button: {
        width: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
        height: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
        borderRadius: 12,
        backgroundColor: KENKEN_COLORS.ACTION_BUTTON_BG,
        justifyContent: 'center',
        alignItems: 'center',
      },

      clearButton: {
        flex: 1,
        height: KENKEN_SIZING.ACTION_BAR_BUTTON_SIZE,
        borderRadius: 12,
        backgroundColor: KENKEN_COLORS.CLEAR_BUTTON_BG,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
      },
      clearButtonText: {
        color: KENKEN_COLORS.CLEAR_BUTTON_TEXT,
        fontWeight: '600',
        fontSize: 15,
      },
      icon: {
        color: KENKEN_COLORS.ACTION_BUTTON_ICON,
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} onPress={onUndo} style={styles.button}>
        <Icon name="undo" size={20} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={onClear} style={styles.clearButton}>
        <Icon name="format-list-bulleted-square" size={16} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
        <AppText style={styles.clearButtonText}>CLEAR</AppText>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={onRedo} style={styles.button}>
        <Icon name="redo" size={20} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={onHint} style={styles.button}>
        <Icon name="lightbulb" size={20} color={KENKEN_COLORS.ACTION_BUTTON_ICON} />
      </TouchableOpacity>
    </View>
  );
};

export const KenKenActionBar = React.memo(KenKenActionBarComponent);
