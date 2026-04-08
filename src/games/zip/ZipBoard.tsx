import React, { useCallback, useRef, useEffect } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import Svg from "react-native-svg";
import { useTheme } from "../../constants/context/ThemeContext";
import { GameNode } from "./components/GameNode";
import { PathLayer } from "./components/PathLayer";
import { GridBackground } from "./components/GridBackground";
import type { Point, ZipGameState, PathSegment } from "./ZipTypes";

type Props = {
  gameState: ZipGameState | null;
  boardSize: number;
  onCellTap: (cell: Point) => void;
  onDragStart: (cell: Point) => void;
  onDragCell: (cell: Point) => void;
  nextHint: Point | null;
  hintPath: PathSegment[];
  filledCells: Set<string>;
  theme: any;
  showLastNodeWarning: boolean;
};

export const ZipBoard = React.memo(
  ({ gameState, boardSize, onCellTap, onDragStart, onDragCell, nextHint, hintPath, filledCells, theme, showLastNodeWarning }: Props) => {
    if (!gameState) {
      console.log("🎮 [BOARD] No gameState, returning null");
      return null;
    }

    console.log("🎮 [BOARD] Rendering board - path length:", gameState.path.length, "hint length:", hintPath.length);

    const cellSize = boardSize / gameState.gridSize;
    const boardRef = useRef<View>(null);
    const dragStateRef = useRef({ lastCell: { x: -1, y: -1 }, isDragging: false, startX: 0, startY: 0 });

    const onDragStartRef = useRef(onDragStart);
    const onDragCellRef = useRef(onDragCell);
    const onCellTapRef = useRef(onCellTap);
    const getCellFromTouchRef = useRef<(x: number, y: number) => Point | null>(() => null);

    const getCellFromTouch = useCallback((x: number, y: number): Point | null => {
      if (x < 0 || y < 0 || x > boardSize || y > boardSize) return null;
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      if (cellX >= 0 && cellX < gameState.gridSize && cellY >= 0 && cellY < gameState.gridSize) {
        return { x: cellX, y: cellY };
      }
      return null;
    }, [boardSize, cellSize, gameState.gridSize]);

    useEffect(() => {
      onDragStartRef.current = onDragStart;
    }, [onDragStart]);

    useEffect(() => {
      onDragCellRef.current = onDragCell;
    }, [onDragCell]);

    useEffect(() => {
      onCellTapRef.current = onCellTap;
    }, [onCellTap]);

    useEffect(() => {
      getCellFromTouchRef.current = getCellFromTouch;
    }, [getCellFromTouch]);

    const fillCellsBetween = useCallback((from: Point, to: Point): Point[] => {
      const cells: Point[] = [];
      let current = { ...from };
      
      while (current.x !== to.x || current.y !== to.y) {
        if (current.x !== to.x) {
          current = { ...current, x: current.x + Math.sign(to.x - current.x) };
        } else {
          current = { ...current, y: current.y + Math.sign(to.y - current.y) };
        }
        cells.push({ ...current });
      }
      
      return cells;
    }, []);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,

        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          dragStateRef.current = { 
            lastCell: { x: -1, y: -1 }, 
            isDragging: true,
            startX: locationX,
            startY: locationY
          };
          const cell = getCellFromTouchRef.current(locationX, locationY);
          if (cell) {
            dragStateRef.current.lastCell = { ...cell };
            onDragStartRef.current(cell);
          }
        },

        onPanResponderMove: (evt) => {
          if (!dragStateRef.current.isDragging) return;

          const { locationX, locationY } = evt.nativeEvent;
          const cell = getCellFromTouchRef.current(locationX, locationY);
          console.log("🖐️ [DRAG] Move - cell:", cell);

          if (!cell) return;

          const lastCell = dragStateRef.current.lastCell;
          if (cell.x === lastCell.x && cell.y === lastCell.y) return;

          const dx = Math.abs(cell.x - lastCell.x);
          const dy = Math.abs(cell.y - lastCell.y);

          if (dx + dy > 1) {
            const intermediateCells = fillCellsBetween(lastCell, cell);
            for (const intermediateCell of intermediateCells) {
              onDragCellRef.current(intermediateCell);
              dragStateRef.current.lastCell = intermediateCell;
            }
          }

          dragStateRef.current.lastCell = { ...cell };
          onDragCellRef.current(cell);
        },

        onPanResponderRelease: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          
          // Check if this was a tap (no significant movement) vs drag
          const distX = Math.abs(locationX - dragStateRef.current.startX);
          const distY = Math.abs(locationY - dragStateRef.current.startY);
          const TAP_THRESHOLD = 10; // pixels - lower threshold for accuracy
          
          if (distX < TAP_THRESHOLD && distY < TAP_THRESHOLD) {
            // This is a tap, not a drag - get the tapped cell
            const cell = getCellFromTouchRef.current(locationX, locationY);
            if (cell) {
              onCellTapRef.current(cell);
            }
          }
          
          dragStateRef.current.isDragging = false;
        },

        onPanResponderTerminate: () => {
          dragStateRef.current.isDragging = false;
        },
      })
    ).current;

    return (
      <View
        ref={boardRef}
        style={[styles.board, { width: boardSize, height: boardSize, backgroundColor: theme.background.secondary }]}
        pointerEvents="auto"
        {...panResponder.panHandlers}
      >
        <Svg style={styles.svg} width={boardSize} height={boardSize} pointerEvents="none">
          <GridBackground
            gridSize={gameState.gridSize}
            boardSize={boardSize}
            cellSize={cellSize}
            obstacles={gameState.obstacles}
            theme={theme}
          />
          <PathLayer gameState={gameState} hintPath={hintPath} boardSize={boardSize} cellSize={cellSize} theme={theme} />
        </Svg>

        {gameState.nodes.map((node) => (
          <GameNode
            key={`node-${node.number}`}
            node={node}
            cellSize={cellSize}
            isActive={node.number === gameState.currentNodeIndex + 1}
            theme={theme}
            styles={styles}
          />
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.gameState === nextProps.gameState &&
      prevProps.boardSize === nextProps.boardSize &&
      prevProps.onCellTap === nextProps.onCellTap &&
      prevProps.onDragStart === nextProps.onDragStart &&
      prevProps.onDragCell === nextProps.onDragCell &&
      prevProps.nextHint === nextProps.nextHint &&
      prevProps.hintPath === nextProps.hintPath &&
      prevProps.filledCells === nextProps.filledCells &&
      prevProps.theme === nextProps.theme &&
      prevProps.showLastNodeWarning === nextProps.showLastNodeWarning
    );
  }
);

ZipBoard.displayName = "ZipBoard";

const styles = StyleSheet.create({
  board: {
    overflow: "hidden",
    borderRadius: 12,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  nodeWrap: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  node: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
