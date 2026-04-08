export type CellState = 'unrevealed' | 'revealed' | 'flagged';

export type Cell = {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
  row: number;
  col: number;
  isHitMine?: boolean;
};

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'huge';

export type DifficultyConfig = {
  rows: number;
  cols: number;
  mines: number;
  cellSize: number;
};

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type MinesweeperGameState = {
  board: Cell[][];
  status: GameStatus;
  difficulty: Difficulty;
  minesRemaining: number;
  elapsedSeconds: number;
  firstTapDone: boolean;
};

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, cellSize: 0 },
  easy: { rows: 9, cols: 9, mines: 15, cellSize: 0 },
  medium: { rows: 16, cols: 16, mines: 40, cellSize: 0 },
  hard: { rows: 16, cols: 30, mines: 99, cellSize: 36 },
  huge: { rows: 20, cols: 24, mines: 130, cellSize: 32 },
};
