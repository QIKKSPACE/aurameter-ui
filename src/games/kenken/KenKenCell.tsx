import React, { useMemo } from 'react';
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
}: Props) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      cell: {
        width: cellSize,
        height: cellSize,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: cellState.isSelected
          ? KENKEN_COLORS.BACKGROUND_CELL_SELECTED
          : cellState.isError
          ? KENKEN_COLORS.BACKGROUND_CELL_ERROR
          : KENKEN_COLORS.BACKGROUND_CELL,
        borderTopWidth: borders.top ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderTopColor: KENKEN_COLORS.CAGE_BORDER_COLOR,
        borderRightWidth: borders.right ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderRightColor: KENKEN_COLORS.CAGE_BORDER_COLOR,
        borderBottomWidth: borders.bottom ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderBottomColor: KENKEN_COLORS.CAGE_BORDER_COLOR,
        borderLeftWidth: borders.left ? KENKEN_SIZING.CAGE_BOUNDARY_BORDER : KENKEN_SIZING.INNER_SAME_CAGE_BORDER,
        borderLeftColor: KENKEN_COLORS.CAGE_BORDER_COLOR,
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
  }, [cellSize, cellState.isSelected, cellState.isError, digitFontSize, borders]);

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
