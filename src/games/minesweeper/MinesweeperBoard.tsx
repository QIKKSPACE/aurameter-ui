import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { MinesweeperGameState, DIFFICULTY_CONFIGS } from './MinesweeperTypes';
import MinesweeperCell from './MinesweeperCell';
import { MINESWEEPER_COLORS } from './MinesweeperColors';

type Props = {
  gameState: MinesweeperGameState;
  onCellTap: (row: number, col: number) => void;
  onCellLongPress: (row: number, col: number) => void;
};

export default function MinesweeperBoard({ gameState, onCellTap, onCellLongPress }: Props) {
  const { width } = useWindowDimensions();
  const config = DIFFICULTY_CONFIGS[gameState.difficulty];

  const cellSize = useMemo(() => {
    if (config.cellSize === 0) {
      const padding = 32;
      return Math.floor((width - padding) / config.cols);
    }
    return config.cellSize;
  }, [config, width]);

  const isScrollable = gameState.difficulty === 'hard' || gameState.difficulty === 'huge';

  const handleCellTap = useCallback(
    (row: number, col: number) => {
      onCellTap(row, col);
    },
    [onCellTap]
  );

  const handleCellLongPress = useCallback(
    (row: number, col: number) => {
      onCellLongPress(row, col);
    },
    [onCellLongPress]
  );

  if (isScrollable) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={true}
        >
          <View
            style={{
              backgroundColor: MINESWEEPER_COLORS.CELL_REVEALED,
              borderRadius: 8,
              padding: 4,
            }}
          >
            {gameState.board.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: 'row' }}
              >
                {row.map((cell, colIndex) => (
                  <MinesweeperCell
                    key={colIndex}
                    cell={cell}
                    cellSize={cellSize}
                    onTap={() => handleCellTap(rowIndex, colIndex)}
                    onLongPress={() => handleCellLongPress(rowIndex, colIndex)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: MINESWEEPER_COLORS.CELL_REVEALED,
          borderRadius: 8,
          padding: 4,
        }}
      >
        {gameState.board.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={{
              flexDirection: 'row',
            }}
          >
            {row.map((cell, colIndex) => (
              <MinesweeperCell
                key={`cell-${rowIndex}-${colIndex}`}
                cell={cell}
                cellSize={cellSize}
                onTap={() => handleCellTap(rowIndex, colIndex)}
                onLongPress={() => handleCellLongPress(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
