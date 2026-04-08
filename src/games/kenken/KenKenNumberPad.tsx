import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { getNumberPadButtonSize, KENKEN_COLORS } from './KenKenColors';

type Props = {
  gridSize: number;
  onNumberPress: (digit: number) => void;
};

const KenKenNumberPadComponent = ({ gridSize, onNumberPress }: Props) => {
  const buttonSize = getNumberPadButtonSize(gridSize);
  const isTwoRows = gridSize > 6;
  const digitsPerRow = isTwoRows ? 5 : gridSize;

  const styles = useMemo(() => {
    return StyleSheet.create({
      container: {
        paddingHorizontal: 16,
        paddingBottom: 0,
        backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
      },
      rowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: isTwoRows ? 12 : 0,
      },
      button: {
        width: buttonSize,
        height: buttonSize,
        borderRadius: 14,
        backgroundColor: KENKEN_COLORS.NUMBER_PAD_BUTTON_BG,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonText: {
        color: KENKEN_COLORS.NUMBER_PAD_DIGIT_COLOR,
        fontWeight: '700' as const,
        fontSize: gridSize <= 6 ? 22 : 18,
      },
    });
  }, [buttonSize, gridSize, isTwoRows]);

  const digits = Array.from({ length: gridSize }, (_, i) => i + 1);

  if (isTwoRows) {
    const firstRowDigits = digits.slice(0, 5);
    const secondRowDigits = digits.slice(5);

    return (
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          {firstRowDigits.map((digit) => (
            <TouchableOpacity
              key={`digit-${digit}`}
              activeOpacity={0.7}
              onPress={() => onNumberPress(digit)}
              style={styles.button}
            >
              <AppText style={styles.buttonText}>{digit}</AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.rowContainer}>
          {secondRowDigits.map((digit) => (
            <TouchableOpacity
              key={`digit-${digit}`}
              activeOpacity={0.7}
              onPress={() => onNumberPress(digit)}
              style={styles.button}
            >
              <AppText style={styles.buttonText}>{digit}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {digits.map((digit) => (
          <TouchableOpacity
            key={`digit-${digit}`}
            activeOpacity={0.7}
            onPress={() => onNumberPress(digit)}
            style={styles.button}
          >
            <AppText style={styles.buttonText}>{digit}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const KenKenNumberPad = React.memo(KenKenNumberPadComponent);
