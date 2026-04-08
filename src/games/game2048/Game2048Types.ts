export type TileValue = 0 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192;

export type Tile = {
  id: string;
  value: TileValue;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
  prevRow: number;
  prevCol: number;
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameStatus = 'playing' | 'won' | 'lost' | 'continuing';

export type Game2048State = {
  tiles: Tile[];
  score: number;
  bestScore: number;
  status: GameStatus;
  moveCount: number;
};

export type MoveResult = {
  tiles: Tile[];
  scoreDelta: number;
  moved: boolean;
};
