import type { Level, ZipGameState, Point, PathSegment, Node, Obstacle } from "./ZipTypes";

export * from "./engine/index";

import { validateMove } from "./engine/pathValidation";

export const getValidMoves = (
  position: Point,
  gridSize: number,
  obstacles: Obstacle[],
  path: PathSegment[],
  currentNodeIndex: number,
  nodes: Node[]
): Point[] => {
  const moves: Point[] = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  for (const dir of directions) {
    const nextPos = { x: position.x + dir.x, y: position.y + dir.y };
    if (validateMove(position, nextPos, gridSize, obstacles, path, currentNodeIndex, nodes)) {
      moves.push(nextPos);
    }
  }

  return moves;
};

export const resetLevel = (level: Level): ZipGameState => {
  return {
    currentLevel: level.id,
    gridSize: level.gridSize,
    nodes: level.nodes,
    obstacles: level.obstacles,
    path: [],
    currentNodeIndex: 0,
    selectedStartNode: null,
    gameOver: false,
    completed: false,
    timerStartTime: null,
    elapsedTime: 0,
    hintsRemaining: 3,
    undoStack: [],
  };
};

export const undoMove = (state: ZipGameState): ZipGameState => {
  if (state.path.length === 0) return state;

  const newPath = state.path.slice(0, -1);
  let newNodeIndex = state.currentNodeIndex;

  if (newPath.length === 0) {
    newNodeIndex = 0;
  }

  return {
    ...state,
    path: newPath,
    currentNodeIndex: newNodeIndex,
  };
};
