/**
 * Board.js
 * Responsive NxN game board (3×3, 4×4, or 5×5).
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Cell from './Cell';

const Board = ({ board, onCellPress, theme, result, disabled, boardSize = 3 }) => {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const winningCells = useMemo(() => {
        if (result?.line) {
            return new Set(result.line);
        }
        return new Set();
    }, [result]);

    // Calculate board and cell sizes dynamically
    const boardDimension = useMemo(() => {
        const maxSize = Math.min(SCREEN_WIDTH - 48, 360);
        // Slightly smaller for larger boards to fit on screen
        if (boardSize >= 5) return Math.min(SCREEN_WIDTH - 32, 380);
        if (boardSize >= 4) return Math.min(SCREEN_WIDTH - 36, 370);
        return maxSize;
    }, [boardSize]);

    const cellSize = useMemo(() => {
        const padding = 8; // board padding
        const gaps = (boardSize - 1) * 6; // margin between cells (3px * 2 per gap)
        return Math.floor((boardDimension - padding - gaps) / boardSize);
    }, [boardDimension, boardSize]);

    const renderRows = () => {
        const rows = [];
        for (let row = 0; row < boardSize; row++) {
            const cells = [];
            for (let col = 0; col < boardSize; col++) {
                const index = row * boardSize + col;
                cells.push(
                    <Cell
                        key={index}
                        index={index}
                        value={board[index]}
                        onPress={onCellPress}
                        theme={theme}
                        isWinningCell={winningCells.has(index)}
                        disabled={disabled}
                        cellSize={cellSize}
                    />,
                );
            }
            rows.push(
                <View key={row} style={styles.row}>
                    {cells}
                </View>,
            );
        }
        return rows;
    };

    return (
        <View
            style={[
                styles.board,
                {
                    backgroundColor: theme.boardColor,
                    borderColor: theme.boardBorder,
                    width: boardDimension,
                    height: boardDimension,
                },
            ]}
        >
            {renderRows()}
        </View>
    );
};

const styles = StyleSheet.create({
    board: {
        borderRadius: 24,
        borderWidth: 2,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
    },
});

export default memo(Board);
