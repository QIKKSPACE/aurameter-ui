import React, { useMemo, useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import AppText from '../../components/AppText';
import { KENKEN_COLORS, KENKEN_SIZING } from './KenKenColors';
import type { CellState, CageBorders } from './KenKenTypes';

type Props = {
  cellState: CellState;
  row: number;
  col: number;
  cellSize: number;
  borders: CageBorders;
  isCageTopLeft: boolean;
  cageLabel: string;
  onPress: (row: number, col: number) => void;
  digitFontSize: number;
  isHighlighted?: boolean;
  isFlashing?: boolean;
};

const KenKenCellComponent = ({
  cellState,
  row,
  col,
  cellSize,
  borders,
  isCageTopLeft,
  cageLabel,
  onPress,
  digitFontSize,
  isHighlighted = false,
  isFlashing = false,
}: Props) => {
  const [flashProgress, setFlashProgress] = useState(0);

  useEffect(() => {
    if (!isFlashing) {
      setFlashProgress(0);
      return;
    }

    const duration = 1500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setFlashProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isFlashing]);
  const styles = useMemo(() => {
    // Determine background color
    let backgroundColor: string;

    if (isFlashing) {
      // Animate from green (#39FF14) to normal background
      const normalBg = cellState.isSelected
        ? KENKEN_COLORS.BACKGROUND_CELL_SELECTED
        : cellState.isError
        ? KENKEN_COLORS.BACKGROUND_CELL_ERROR
        : KENKEN_COLORS.BACKGROUND_CELL;

      // Interpolate between green and normal background
      const greenR = 57,
        greenG = 255,
        greenB = 20;
      const normalBgToRgb = (bg: string) => {
        if (bg === KENKEN_COLORS.BACKGROUND_CELL_SELECTED) return { r: 99, g: 99, b: 115 };
        if (bg === KENKEN_COLORS.BACKGROUND_CELL_ERROR) return { r: 255, b: 100, g: 100 };
        return { r: 28, g: 28, b: 30 }; // normal background
      };

      const normal = normalBgToRgb(normalBg);
      const r = Math.round(greenR + (normal.r - greenR) * flashProgress);
      const g = Math.round(greenG + (normal.g - greenG) * flashProgress);
      const b = Math.round(greenB + (normal.b - greenB) * flashProgress);
      backgroundColor = `rgb(${r}, ${g}, ${b})`;
    } else if (isHighlighted) {
      // If highlighted and has value: red (wrong cell)
      // If highlighted and empty: purple (cage highlight)
      backgroundColor = cellState.value !== null ? '#FF3B3B' : 'rgba(139,143,232,0.3)';
    } else {
      backgroundColor = cellState.isSelected
        ? KENKEN_COLORS.BACKGROUND_CELL_SELECTED
        : cellState.isError
        ? KENKEN_COLORS.BACKGROUND_CELL_ERROR
        : KENKEN_COLORS.BACKGROUND_CELL;
    }

    // Determine border color
    let borderColor = KENKEN_COLORS.CAGE_BORDER_COLOR;
    if (isHighlighted && cellState.value === null) {
      borderColor = '#8B8FE8'; // Purple border for cage highlight
    } else if (isHighlighted && cellState.value !== null) {
      borderColor = '#FF3B3B'; // Red border for wrong cell
    }

    return StyleSheet.create({
      cell: {
        width: cellSize,
        height: cellSize,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor,
        borderTopWidth: borders.top ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderTopColor: borderColor,
        borderRightWidth: borders.right ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderRightColor: borderColor,
        borderBottomWidth: borders.bottom ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderBottomColor: borderColor,
        borderLeftWidth: borders.left ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderLeftColor: borderColor,
      },
      label: {
        position: 'absolute' as const,
        top: 2,
        left: 3,
        fontSize: 10,
        fontWeight: '400' as const,
        color: KENKEN_COLORS.CAGE_LABEL_COLOR,
      },
      digit: {
        fontSize: digitFontSize,
        fontWeight: '600' as const,
        color: cellState.isError ? KENKEN_COLORS.DIGIT_COLOR_ERROR : KENKEN_COLORS.DIGIT_COLOR,
      },
      notesContainer: {
        width: '100%',
        height: '100%',
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 2,
      },
      note: {
        fontSize: 8,
        fontWeight: '400' as const,
        color: 'rgba(139,143,232,0.6)',
        width: '33.33%',
        textAlign: 'center' as const,
      },
    });
  }, [cellSize, cellState.isSelected, cellState.isError, digitFontSize, borders, isHighlighted, isFlashing, flashProgress, cellState.value]);

  const handlePress = () => {
    if (!cellState.isGiven) {
      onPress(row, col);
    }
  };

  return (
    <TouchableOpacity activeOpacity={cellState.isGiven ? 1 : 0.7} onPress={handlePress} style={styles.cell}>
      {isCageTopLeft && cageLabel && <AppText style={styles.label}>{cageLabel}</AppText>}

      {cellState.value !== null ? (
        <AppText style={styles.digit}>{cellState.value}</AppText>
      ) : cellState.notes.length > 0 ? (
        <View style={styles.notesContainer}>
          {Array.from({ length: Math.ceil(cellSize / 15) }).map((_, noteIndex) => {
            const note = cellState.notes[noteIndex];
            return (
              <AppText key={`note-${noteIndex}`} style={styles.note}>
                {note || ''}
              </AppText>
            );
          })}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export const KenKenCell = React.memo(KenKenCellComponent);
