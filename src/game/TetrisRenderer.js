import React, { useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Group, RoundedRect, Rect } from "@shopify/react-native-skia";
import Animated, {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  getGhostPiece,
  getPieceCells,
} from "./tetrisEngine";

const EMPTY_CELL_COLOR = "rgba(255,255,255,0.045)";
const GRID_LINE = "rgba(255,255,255,0.055)";
const GHOST_COLOR = "rgba(255,255,255,0.16)";

const lighten = (color) => `${color}ee`;

const buildBoardCells = (board) => {
  const cells = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = board[y][x];
      if (!color) continue;
      cells.push({ x, y, color });
    }
  }
  return cells;
};

const getRelativePieceCells = (piece) => {
  if (!piece) return [];
  const cells = [];
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) cells.push({ x: colIndex, y: rowIndex, color: piece.color });
    });
  });
  return cells;
};

const BACKGROUND_CELLS = Array.from({ length: BOARD_HEIGHT * BOARD_WIDTH }, (_, index) => ({
  x: index % BOARD_WIDTH,
  y: Math.floor(index / BOARD_WIDTH),
}));

const TetrisBackground = React.memo(({ boardWidth, boardHeight, cellSize }) => (
  <Group>
    {BACKGROUND_CELLS.map(cell => (
      <RoundedRect
        key={`cell-bg-${cell.x}-${cell.y}`}
        x={cell.x * cellSize + 1}
        y={cell.y * cellSize + 1}
        width={cellSize - 2}
        height={cellSize - 2}
        r={5}
        color={EMPTY_CELL_COLOR}
      />
    ))}
    {Array.from({ length: BOARD_WIDTH + 1 }).map((_, x) => (
      <Rect
        key={`grid-v-${x}`}
        x={x * cellSize}
        y={0}
        width={1}
        height={boardHeight}
        color={GRID_LINE}
      />
    ))}
    {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, y) => (
      <Rect
        key={`grid-h-${y}`}
        x={0}
        y={y * cellSize}
        width={boardWidth}
        height={1}
        color={GRID_LINE}
      />
    ))}
  </Group>
));

const TetrisBoardCells = React.memo(({ boardCells, clearingSet, cellSize }) => (
  <Group>
    {boardCells.map((cell) => {
      const isClearing = clearingSet.has(cell.y);
      return (
        <Group key={`board-${cell.x}-${cell.y}`}>
          <RoundedRect
            x={cell.x * cellSize + 2}
            y={cell.y * cellSize + 2}
            width={cellSize - 4}
            height={cellSize - 4}
            r={6}
            color={isClearing ? "#ffffff" : cell.color}
          />
          <RoundedRect
            x={cell.x * cellSize + 5}
            y={cell.y * cellSize + 5}
            width={cellSize - 10}
            height={(cellSize - 10) * 0.35}
            r={4}
            color={isClearing ? "#ffffff" : lighten(cell.color)}
          />
        </Group>
      );
    })}
  </Group>
));

function TetrisRenderer({
  board,
  currentPiece,
  clearingRows = [],
  boardAnimatedStyle,
  cellSize,
}) {
  const boardWidth = cellSize * BOARD_WIDTH;
  const boardHeight = cellSize * BOARD_HEIGHT;
  const boardCells = useMemo(() => buildBoardCells(board), [board]);
  
  const relativePieceCells = useMemo(() => getRelativePieceCells(currentPiece), [currentPiece]);
  const ghostPiece = useMemo(() => getGhostPiece(board, currentPiece), [board, currentPiece]);
  
  const clearingSet = useMemo(() => new Set(clearingRows), [clearingRows]);

  const animX = useSharedValue(currentPiece?.x ?? 0);
  const animY = useSharedValue(currentPiece?.y ?? 0);
  const ghostAnimX = useSharedValue(ghostPiece?.x ?? 0);
  const ghostAnimY = useSharedValue(ghostPiece?.y ?? 0);

  useEffect(() => {
    if (currentPiece) {
      animX.value = withTiming(currentPiece.x, {
        duration: 90,
        easing: Easing.out(Easing.cubic),
      });
      animY.value = withTiming(currentPiece.y, {
        duration: 90,
        easing: Easing.out(Easing.cubic),
      });
    }
    if (ghostPiece) {
      ghostAnimX.value = ghostPiece.x;
      ghostAnimY.value = ghostPiece.y;
    }
  }, [currentPiece, ghostPiece, animX, animY, ghostAnimX, ghostAnimY]);

  const pieceTransform = useDerivedValue(() => [
    { translateX: animX.value * cellSize },
    { translateY: animY.value * cellSize },
  ]);

  const ghostTransform = useDerivedValue(() => [
    { translateX: ghostAnimX.value * cellSize },
    { translateY: ghostAnimY.value * cellSize },
  ]);

  return (
    <Animated.View
      style={[
        styles.boardShell,
        {
          width: boardWidth,
          height: boardHeight,
        },
        boardAnimatedStyle,
      ]}
    >
      <View style={styles.boardGlow} />
      <Canvas style={{ width: boardWidth, height: boardHeight }}>
        <RoundedRect
          x={0}
          y={0}
          width={boardWidth}
          height={boardHeight}
          r={18}
          color="#0a0d18"
        />

        <TetrisBackground boardWidth={boardWidth} boardHeight={boardHeight} cellSize={cellSize} />

        <Group transform={ghostTransform}>
          {relativePieceCells.map((cell, index) => (
            <RoundedRect
              key={`ghost-${index}-${cell.x}-${cell.y}`}
              x={cell.x * cellSize + 4}
              y={cell.y * cellSize + 4}
              width={cellSize - 8}
              height={cellSize - 8}
              r={6}
              color={GHOST_COLOR}
            />
          ))}
        </Group>

        <TetrisBoardCells boardCells={boardCells} clearingSet={clearingSet} cellSize={cellSize} />

        <Group transform={pieceTransform}>
          {relativePieceCells.map((cell, index) => (
            <Group key={`piece-${index}-${cell.x}-${cell.y}`}>
              <RoundedRect
                x={cell.x * cellSize + 1}
                y={cell.y * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                r={7}
                color="rgba(255,255,255,0.22)"
              />
              <RoundedRect
                x={cell.x * cellSize + 3}
                y={cell.y * cellSize + 3}
                width={cellSize - 6}
                height={cellSize - 6}
                r={6}
                color={cell.color}
              />
              <RoundedRect
                x={cell.x * cellSize + 6}
                y={cell.y * cellSize + 6}
                width={cellSize - 12}
                height={(cellSize - 12) * 0.35}
                r={4}
                color={lighten(cell.color)}
              />
            </Group>
          ))}
        </Group>
      </Canvas>
    </Animated.View>
  );
}

export default React.memo(TetrisRenderer);

const styles = StyleSheet.create({
  boardShell: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#080a12",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#6ddcff",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 10,
  },
  boardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: "rgba(109,220,255,0.05)",
  },
});
