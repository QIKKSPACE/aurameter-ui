/**
 * Tetris Game Engine
 * ------------------
 * Pure logic layer.
 * No UI. No animations.
 */

import {
  setBoard,
  setCurrentPiece,
  setNextPiece,
  clearLines,
  gameOver,
} from "../store/tetrisGameSlice";

/**
 * Board constants
 */
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/**
 * Tetromino definitions
 * Each piece = matrix + color
 */
export const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  },
  L: {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: "#f0a000",
  },
  J: {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: "#0000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

/**
 * Helpers
 */
export const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(0)
  );

const randomTetromino = () => {
  const key =
    TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  const def = TETROMINOS[key];

  return {
    key,
    shape: def.shape,
    color: def.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(def.shape[0].length / 2),
    y: 0,
  };
};

/**
 * Collision detection
 */
export const hasCollision = (board, piece, offsetX = 0, offsetY = 0) => {
  const { shape, x, y } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;

      const newX = x + col + offsetX;
      const newY = y + row + offsetY;

      // Wall / floor
      if (
        newX < 0 ||
        newX >= BOARD_WIDTH ||
        newY >= BOARD_HEIGHT
      ) {
        return true;
      }

      // Board collision
      if (newY >= 0 && board[newY][newX]) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Merge piece into board
 */
const mergePiece = (board, piece) => {
  const newBoard = board.map(row => [...row]);

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        newBoard[piece.y + y][piece.x + x] = piece.color;
      }
    });
  });

  return newBoard;
};

/**
 * Clear full lines
 */
const clearFullLines = (board) => {
  const newBoard = board.filter(
    row => row.some(cell => !cell)
  );

  const cleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { newBoard, cleared };
};

/**
 * Rotate matrix (clockwise)
 */
const rotateMatrix = (matrix) => {
  return matrix[0].map((_, i) =>
    matrix.map(row => row[i]).reverse()
  );
};

/**
 * ENGINE ACTIONS
 * These are called by gestures or gravity timer
 */

export const spawnPiece = (dispatch, getState) => {
  const state = getState().tetrisGame;
  const board = state.board;

  const piece = state.nextPiece || randomTetromino();
  const next = randomTetromino();

  // Game over check
  if (hasCollision(board, piece, 0, 0)) {
    dispatch(gameOver());
    return;
  }

  dispatch(setCurrentPiece(piece));
  dispatch(setNextPiece(next));
};

export const movePiece = (direction) => (dispatch, getState) => {
  const { board, currentPiece, status } = getState().tetrisGame;
  if (!currentPiece || status !== "playing") return;

  const dx = direction === "left" ? -1 : 1;

  if (!hasCollision(board, currentPiece, dx, 0)) {
    dispatch(
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dx })
    );
  }
};

export const rotatePiece = () => (dispatch, getState) => {
  const { board, currentPiece, status } = getState().tetrisGame;
  if (!currentPiece || status !== "playing") return;

  const rotated = rotateMatrix(currentPiece.shape);

  const testPiece = {
    ...currentPiece,
    shape: rotated,
  };

  if (!hasCollision(board, testPiece, 0, 0)) {
    dispatch(setCurrentPiece(testPiece));
  }
};

export const dropPiece = () => (dispatch, getState) => {
  const { board, currentPiece, status } = getState().tetrisGame;
  if (!currentPiece || status !== "playing") return;

  if (!hasCollision(board, currentPiece, 0, 1)) {
    dispatch(
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 })
    );
  } else {
    // Lock piece
    const mergedBoard = mergePiece(board, currentPiece);
    const { newBoard, cleared } = clearFullLines(mergedBoard);

    dispatch(setBoard(newBoard));
    if (cleared > 0) {
      dispatch(clearLines(cleared));
    }

    dispatch(setCurrentPiece(null));
    spawnPiece(dispatch, getState);
  }
};

export const hardDrop = () => (dispatch, getState) => {
  const { board, currentPiece } = getState().tetrisGame;
  if (!currentPiece) return;

  let offset = 0;
  while (!hasCollision(board, currentPiece, 0, offset + 1)) {
    offset++;
  }

  dispatch(
    setCurrentPiece({
      ...currentPiece,
      y: currentPiece.y + offset,
    })
  );

  dispatch(dropPiece());
};
