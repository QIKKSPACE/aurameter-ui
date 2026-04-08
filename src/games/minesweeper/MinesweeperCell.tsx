import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Cell } from './MinesweeperTypes';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  cell: Cell;
  cellSize: number;
  onTap: () => void;
  onLongPress: () => void;
};

const MinesweeperCell = React.memo(
  ({ cell, cellSize, onTap, onLongPress }: Props) => {
    const styles = useMemo(
      () =>
        StyleSheet.create({
          cell: {
            width: cellSize,
            height: cellSize,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3,
          },
          unrevealed: {
            backgroundColor: MINESWEEPER_COLORS.CELL_UNREVEALED,
            borderWidth: 1,
            borderColor: MINESWEEPER_COLORS.CELL_BORDER,
          },
          revealed: {
            backgroundColor: MINESWEEPER_COLORS.CELL_REVEALED,
            borderWidth: 0,
          },
          mineHit: {
            backgroundColor: MINESWEEPER_COLORS.CELL_MINE_HIT,
          },
          mineUnrevealed: {
            backgroundColor: MINESWEEPER_COLORS.CELL_MINE_UNREVEALED,
          },
          numberText: {
            fontSize: cellSize * 0.5,
            fontWeight: '700',
          },
        }),
      [cellSize]
    );

    const renderCellContent = () => {
      if (cell.state === 'unrevealed') {
        return null;
      }

      if (cell.state === 'flagged') {
        return (
          <View
            style={{
              width: cellSize * 0.4,
              height: cellSize * 0.35,
              backgroundColor: '#E74C3C',
              borderRadius: 2,
            }}
          />
        );
      }

      if (cell.isMine) {
        return (
          <View
            style={{
              width: cellSize * 0.3,
              height: cellSize * 0.3,
              backgroundColor: cell.isHitMine ? '#FFFFFF' : MINESWEEPER_COLORS.MINE_COLOR,
              borderRadius: cellSize * 0.15,
            }}
          />
        );
      }

      if (cell.adjacentMines > 0) {
        return (
          <Text
            style={[
              styles.numberText,
              { color: MINESWEEPER_COLORS.NUMBER_COLORS[cell.adjacentMines as keyof typeof MINESWEEPER_COLORS.NUMBER_COLORS] },
            ]}
          >
            {cell.adjacentMines}
          </Text>
        );
      }

      return null;
    };

    const cellStyle = cell.state === 'unrevealed'
      ? [styles.cell, styles.unrevealed]
      : cell.state === 'revealed' && cell.isMine
      ? cell.isHitMine
        ? [styles.cell, styles.mineHit]
        : [styles.cell, styles.mineUnrevealed]
      : [styles.cell, styles.revealed];

    return (
      <TouchableOpacity
        onPress={() => onTap()}
        onLongPress={() => onLongPress()}
        delayLongPress={400}
        activeOpacity={0.7}
        style={[cellStyle, { width: cellSize, height: cellSize }]}
      >
        {renderCellContent()}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.cell.state === nextProps.cell.state &&
      prevProps.cell.isMine === nextProps.cell.isMine &&
      prevProps.cell.adjacentMines === nextProps.cell.adjacentMines &&
      prevProps.cell.isHitMine === nextProps.cell.isHitMine &&
      prevProps.cellSize === nextProps.cellSize
    );
  }
);

MinesweeperCell.displayName = 'MinesweeperCell';

export default MinesweeperCell;
