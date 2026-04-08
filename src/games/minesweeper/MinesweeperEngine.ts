import { Cell, DIFFICULTY_CONFIGS } from './MinesweeperTypes';

export function createEmptyBoard(rows: number, cols: number): Cell[][] {
  const board: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = {
        isMine: false,
        state: 'unrevealed',
        adjacentMines: 0,
        row,
        col,
      };
    }
  }
  return board;
}

export function getAdjacentCells(
  row: number,
  col: number,
  rows: number,
  cols: number
): Array<{ row: number; col: number }> {
  const adjacent: Array<{ row: number; col: number }> = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols && (r !== row || c !== col)) {
        adjacent.push({ row: r, col: c });
      }
    }
  }
  return adjacent;
}

export function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mineCount: number,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })));

  const safeZone = new Set<string>();
  safeZone.add(`${safeRow},${safeCol}`);
  const neighbors = getAdjacentCells(safeRow, safeCol, rows, cols);
  neighbors.forEach(n => safeZone.add(`${n.row},${n.col}`));

  const candidates: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeZone.has(`${r},${c}`)) {
        candidates.push({ row: r, col: c });
      }
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = temp;
  }

  const mines = candidates.slice(0, mineCount);
  mines.forEach(({ row, col }) => {
    newBoard[row][col].isMine = true;
  });

  return calculateAdjacentCounts(newBoard, rows, cols);
}

export function calculateAdjacentCounts(
  board: Cell[][],
  rows: number,
  cols: number
): Cell[][] {
  const newBoard = board.map((row) => [...row]);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!newBoard[row][col].isMine) {
        const adjacent = getAdjacentCells(row, col, rows, cols);
        const mineCount = adjacent.filter((adj) => newBoard[adj.row][adj.col].isMine).length;
        newBoard[row][col].adjacentMines = mineCount;
      }
    }
  }

  return newBoard;
}

export function revealCell(
  board: Cell[][],
  startRow: number,
  startCol: number,
  rows: number,
  cols: number
): Cell[][] {
  const newBoard: Cell[][] = board.map(row =>
    row.map(cell => ({ ...cell }))
  );

  const startCell = newBoard[startRow][startCol];
  if (startCell.state !== 'unrevealed') return newBoard;
  if (startCell.isMine) return newBoard;

  const queue: Array<{ row: number; col: number }> = [
    { row: startRow, col: startCol }
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = newBoard[current.row][current.col];
    if (cell.state !== 'unrevealed') continue;
    if (cell.isMine) continue;

    cell.state = 'revealed';

    if (cell.adjacentMines === 0) {
      const neighbors = getAdjacentCells(
        current.row, current.col, rows, cols
      );
      for (const n of neighbors) {
        const nKey = `${n.row},${n.col}`;
        if (!visited.has(nKey)) {
          const nCell = newBoard[n.row][n.col];
          if (nCell.state === 'unrevealed' && !nCell.isMine) {
            queue.push(n);
          }
        }
      }
    }
  }

  return newBoard;
}

export function toggleFlag(board: Cell[][], row: number, col: number): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cell = newBoard[row][col];
  if (cell.state === 'revealed') return newBoard;
  cell.state = cell.state === 'flagged' ? 'unrevealed' : 'flagged';
  return newBoard;
}

export function checkWin(
  board: Cell[][],
  rows: number,
  cols: number,
  totalMines: number
): boolean {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col];
      if (!cell.isMine && cell.state !== 'revealed') {
        return false;
      }
    }
  }
  return true;
}

export function revealAllMines(board: Cell[][], rows: number, cols: number): Cell[][] {
  const newBoard = board.map(row =>
    row.map(cell => ({ ...cell }))
  );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (newBoard[row][col].isMine) {
        newBoard[row][col].state = 'revealed';
      }
    }
  }

  return newBoard;
}
