/**
 * Tetris Game Engine
 * ------------------
 * Pure game logic for movement, collision, line clears, and piece spawning.
 */

/**
 * Board constants
 */
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 24;

/**
 * Tetromino definitions
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

export const createNewPiece = () => randomTetromino();

export const resetPiecePosition = (piece) => {
  if (!piece) return null;
  return {
    ...piece,
    x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(piece.shape[0].length / 2),
    y: 0,
  };
};

export const getPieceCells = (piece) => {
  if (!piece) return [];

  const cells = [];
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) return;
      cells.push({
        x: piece.x + colIndex,
        y: piece.y + rowIndex,
        color: piece.color,
      });
    });
  });

  return cells;
};

export const hasCollision = (board, piece, offsetX = 0, offsetY = 0) => {
  const { shape, x, y } = piece;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;

      const newX = x + col + offsetX;
      const newY = y + row + offsetY;

      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return true;
      }

      if (newY >= 0 && board[newY][newX]) {
        return true;
      }
    }
  }

  return false;
};

const rotateMatrix = (matrix) =>
  matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

export const rotatePiece = (board, piece) => {
  const rotated = { ...piece, shape: rotateMatrix(piece.shape) };
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    const kicked = { ...rotated, x: rotated.x + kick };
    if (!hasCollision(board, kicked, 0, 0)) {
      return kicked;
    }
  }

  return piece;
};

export const movePiece = (board, piece, direction) => {
  const dx = direction === "left" ? -1 : 1;
  const moved = { ...piece, x: piece.x + dx };
  return hasCollision(board, moved, 0, 0) ? piece : moved;
};

export const softDropPiece = (board, piece) => {
  const dropped = { ...piece, y: piece.y + 1 };
  if (!hasCollision(board, dropped, 0, 0)) {
    return { piece: dropped, locked: false };
  }

  return { piece, locked: true };
};

export const hardDropPiece = (board, piece) => {
  let distance = 0;
  while (!hasCollision(board, piece, 0, distance + 1)) {
    distance += 1;
  }

  return { ...piece, y: piece.y + distance };
};

export const getGhostPiece = (board, piece) => {
  if (!piece) return null;
  return hardDropPiece(board, piece);
};

export const mergePiece = (board, piece) => {
  const newBoard = board.map(row => [...row]);

  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        const targetY = piece.y + rowIndex;
        const targetX = piece.x + colIndex;
        if (
          targetY >= 0 &&
          targetY < BOARD_HEIGHT &&
          targetX >= 0 &&
          targetX < BOARD_WIDTH
        ) {
          newBoard[targetY][targetX] = piece.color;
        }
      }
    });
  });

  return newBoard;
};

export const clearFullLines = (board) => {
  const filtered = board.filter(row => row.some(cell => !cell));
  const cleared = BOARD_HEIGHT - filtered.length;

  while (filtered.length < BOARD_HEIGHT) {
    filtered.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { newBoard: filtered, cleared };
};

export const getFullLineIndexes = (board) =>
  board
    .map((row, index) => (row.every(Boolean) ? index : -1))
    .filter(index => index !== -1);

export const removeLines = (board, lineIndexes) => {
  if (!lineIndexes.length) {
    return { newBoard: board, cleared: 0 };
  }

  const clearing = new Set(lineIndexes);
  const filtered = board.filter((_, index) => !clearing.has(index));

  while (filtered.length < BOARD_HEIGHT) {
    filtered.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { newBoard: filtered, cleared: lineIndexes.length };
};

export const spawnPiece = (board, nextPiece) => {
  const piece = nextPiece || createNewPiece();
  const upcoming = createNewPiece();

  if (hasCollision(board, piece, 0, 0)) {
    return { gameOver: true, piece: null, nextPiece: upcoming };
  }

  return { gameOver: false, piece, nextPiece: upcoming };
};
