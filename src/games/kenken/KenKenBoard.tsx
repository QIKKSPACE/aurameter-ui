import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { KenKenCell } from './KenKenCell';
import { getCageBorders, getCageTopLeftCell, formatCageLabel } from './KenKenEngine';
import { getDigitFontSize, KENKEN_COLORS, KENKEN_SIZING } from './KenKenColors';
import type { KenKenLevel, CellState, CageBorders } from './KenKenTypes';

type Props = {
  level: KenKenLevel;
  grid: CellState[][];
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
  screenWidth: number;
};

const KenKenBoardComponent = ({ level, grid, selectedCell, onCellPress, screenWidth }: Props) => {
  const GRID_WIDTH = screenWidth - KENKEN_SIZING.GRID_PADDING * 2;
  const cellSize = GRID_WIDTH / level.gridSize;

  const { cageBordersMap, cageTopLeftMap, cageLabelMap, digitFontSize } = useMemo(() => {
    const borders = new Map<string, CageBorders>();
    const topLeft = new Map<string, boolean>();
    const labels = new Map<string, string>();

    for (let row = 0; row < level.gridSize; row++) {
      for (let col = 0; col < level.gridSize; col++) {
        const key = `cell-${row}-${col}`;
        borders.set(key, getCageBorders(level, row, col));
      }
    }

    for (const cage of level.cages) {
      const tl = getCageTopLeftCell(cage);
      const tlKey = `cell-${tl.row}-${tl.col}`;
      topLeft.set(tlKey, true);
      labels.set(tlKey, formatCageLabel(cage));
    }

    return {
      cageBordersMap: borders,
      cageTopLeftMap: topLeft,
      cageLabelMap: labels,
      digitFontSize: getDigitFontSize(level.gridSize),
    };
  }, [level]);

  const styles = useMemo(() => {
    return StyleSheet.create({
      gridContainer: {
        width: GRID_WIDTH,
        height: GRID_WIDTH,
        borderWidth: KENKEN_SIZING.OUTER_GRID_BORDER,
        borderColor: KENKEN_COLORS.OUTER_GRID_BORDER,
        borderRadius: KENKEN_SIZING.GRID_BORDER_RADIUS,
        backgroundColor: KENKEN_COLORS.BACKGROUND_SCREEN,
        overflow: 'hidden',
      },
      row: {
        flexDirection: 'row' as const,
        flex: 1,
      },
    });
  }, [GRID_WIDTH]);

  return (
    <View style={styles.gridContainer}>
      {grid.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cell, colIndex) => {
            const cellKey = `cell-${rowIndex}-${colIndex}`;
            const borders = cageBordersMap.get(cellKey) || {
              top: false,
              right: false,
              bottom: false,
              left: false,
            };
            const isCageTopLeft = cageTopLeftMap.has(cellKey);
            const cageLabel = cageLabelMap.get(cellKey) || '';
            const isSelected =
              selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;

            return (
              <KenKenCell
                key={cellKey}
                cellState={{ ...cell, isSelected: !!isSelected }}
                row={rowIndex}
                col={colIndex}
                cellSize={cellSize}
                borders={borders}
                isCageTopLeft={isCageTopLeft}
                cageLabel={cageLabel}
                onPress={onCellPress}
                digitFontSize={digitFontSize}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

export const KenKenBoard = React.memo(KenKenBoardComponent);
