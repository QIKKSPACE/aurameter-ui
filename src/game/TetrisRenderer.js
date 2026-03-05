import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { useSelector } from "react-redux";

/**
 * Screen & board sizing (9:16 portrait)
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Board should feel tall, not full screen
const BOARD_PIXEL_HEIGHT = SCREEN_HEIGHT * 0.75;
const CELL_SIZE = Math.floor(BOARD_PIXEL_HEIGHT / BOARD_HEIGHT);
const BOARD_PIXEL_WIDTH = CELL_SIZE * BOARD_WIDTH;

// Center board horizontally
const BOARD_OFFSET_X = Math.floor((SCREEN_WIDTH - BOARD_PIXEL_WIDTH) / 2);
const BOARD_OFFSET_Y = Math.floor((SCREEN_HEIGHT - BOARD_PIXEL_HEIGHT) / 2);

/**
 * Colors
 */
const EMPTY_CELL_COLOR = "#0b0b12";
const GRID_COLOR = "#151520";

export default function TetrisRenderer() {
  const { board, currentPiece } = useSelector(
    state => state.tetrisGame
  );

  /**
   * Pre-calc draw calls for board
   */
  const boardRects = useMemo(() => {
    const rects = [];

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = board[y][x];

        rects.push({
          x: BOARD_OFFSET_X + x * CELL_SIZE,
          y: BOARD_OFFSET_Y + y * CELL_SIZE,
          color: cell || EMPTY_CELL_COLOR,
        });
      }
    }

    return rects;
  }, [board]);

  /**
   * Current falling piece rects
   */
  const pieceRects = useMemo(() => {
    if (!currentPiece) return [];

    const rects = [];

    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell) return;

        rects.push({
          x:
            BOARD_OFFSET_X +
            (currentPiece.x + x) * CELL_SIZE,
          y:
            BOARD_OFFSET_Y +
            (currentPiece.y + y) * CELL_SIZE,
          color: currentPiece.color,
        });
      });
    });

    return rects;
  }, [currentPiece]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Board cells */}
        {boardRects.map((cell, index) => (
          <Rect
            key={`board-${index}`}
            x={cell.x}
            y={cell.y}
            width={CELL_SIZE - 1}
            height={CELL_SIZE - 1}
            color={cell.color}
          />
        ))}

        {/* Falling piece */}
        {pieceRects.map((cell, index) => (
          <Rect
            key={`piece-${index}`}
            x={cell.x}
            y={cell.y}
            width={CELL_SIZE - 1}
            height={CELL_SIZE - 1}
            color={cell.color}
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050509",
  },
  canvas: {
    flex: 1,
  },
});
