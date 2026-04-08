export type KenKenOperation = '+' | '-' | '*' | '/' | 'given';

export type GridCoord = {
  row: number;
  col: number;
};

export type Cage = {
  id: string;
  cells: GridCoord[];
  target: number;
  operation: KenKenOperation;
};

export type KenKenLevel = {
  id: number;
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  cages: Cage[];
  solution: number[][];
};

export type NoteSet = Set<number>;

export type CellState = {
  value: number | null;
  notes: number[];
  isGiven: boolean;
  isError: boolean;
  isSelected: boolean;
  isHinted: boolean;
  cageId: string;
};

export type CageBorders = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export type KenKenGameState = {
  level: KenKenLevel;
  grid: CellState[][];
  selectedCell: GridCoord | null;
  isCompleted: boolean;
  mistakesCount: number;
  isPencilMode: boolean;
};
