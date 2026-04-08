import { Tile, TileValue, Direction, MoveResult, Game2048State } from './Game2048Types';

export function createInitialState(): Game2048State {
  const tiles: Tile[] = [];

  while (tiles.length < 2) {
    const randomRow = Math.floor(Math.random() * 4);
    const randomCol = Math.floor(Math.random() * 4);
    const value: TileValue = Math.random() < 0.9 ? 2 : 4;

    const existingTile = tiles.some(tile => tile.row === randomRow && tile.col === randomCol);

    if (!existingTile) {
      tiles.push({
        id: `${Date.now()}-${Math.random()}`,
        value,
        row: randomRow,
        col: randomCol,
        isNew: true,
        isMerged: false,
        prevRow: randomRow,
        prevCol: randomCol,
      });
    }
  }

  return {
    tiles,
    score: 0,
    bestScore: 0,
    status: 'playing',
    moveCount: 0,
  };
}

export function spawnTile(tiles: Tile[]): Tile[] {
  const occupiedCells = new Set<string>();
  tiles.forEach((tile) => {
    occupiedCells.add(`${tile.row},${tile.col}`);
  });

  const emptyCells: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!occupiedCells.has(`${row},${col}`)) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) {
    return tiles;
  }

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value: TileValue = Math.random() < 0.9 ? 2 : 4;

  return [
    ...tiles,
    {
      id: `${Date.now()}-${Math.random()}`,
      value,
      row: randomCell.row,
      col: randomCell.col,
      isNew: true,
      isMerged: false,
      prevRow: randomCell.row,
      prevCol: randomCell.col,
    },
  ];
}

export function moveTiles(
  tiles: Tile[],
  direction: Direction
): MoveResult {
  const grid: Array<Array<Tile | null>> = [];
  for (let i = 0; i < 4; i++) {
    grid[i] = [null, null, null, null];
  }

  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile;
  });

  let scoreDelta = 0;
  let moved = false;

  if (direction === 'left') {
    for (let row = 0; row < 4; row++) {
      const result = slideAndMerge(grid[row], 'left');
      grid[row] = result.line;
      scoreDelta += result.score;
      if (result.changed) moved = true;
    }
  } else if (direction === 'right') {
    for (let row = 0; row < 4; row++) {
      const result = slideAndMerge(grid[row], 'right');
      grid[row] = result.line;
      scoreDelta += result.score;
      if (result.changed) moved = true;
    }
  } else if (direction === 'up') {
    for (let col = 0; col < 4; col++) {
      const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]];
      const result = slideAndMerge(column, 'left');
      for (let row = 0; row < 4; row++) {
        grid[row][col] = result.line[row];
      }
      scoreDelta += result.score;
      if (result.changed) moved = true;
    }
  } else if (direction === 'down') {
    for (let col = 0; col < 4; col++) {
      const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]];
      const result = slideAndMerge(column, 'right');
      for (let row = 0; row < 4; row++) {
        grid[row][col] = result.line[row];
      }
      scoreDelta += result.score;
      if (result.changed) moved = true;
    }
  }

  const newTiles: Tile[] = [];
  let rowIndex = 0;
  grid.forEach((row) => {
    row.forEach((tile, colIndex) => {
      if (tile !== null) {
        const prevRow = tile.row;
        const prevCol = tile.col;
        tile.row = rowIndex;
        tile.col = colIndex;
        newTiles.push({
          ...tile,
          prevRow,
          prevCol,
          isNew: false,
        });
      }
    });
    rowIndex++;
  });

  return {
    tiles: newTiles,
    scoreDelta,
    moved,
  };
}

function slideAndMerge(
  line: Array<Tile | null>,
  direction: 'left' | 'right'
): { line: Array<Tile | null>; score: number; changed: boolean } {
  const originalLine = [...line];

  let newLine: Array<Tile | null> = line.filter((tile) => tile !== null);

  while (newLine.length < 4) {
    if (direction === 'left') {
      newLine.push(null);
    } else {
      newLine.unshift(null);
    }
  }

  let score = 0;
  let hasChanged = false;

  if (direction === 'left') {
    for (let i = 0; i < 3; i++) {
      if (
        newLine[i] !== null &&
        newLine[i + 1] !== null &&
        newLine[i]!.value === newLine[i + 1]!.value &&
        !newLine[i]!.isMerged &&
        !newLine[i + 1]!.isMerged
      ) {
        const mergedValue = (newLine[i]!.value * 2) as TileValue;
        newLine[i] = {
          ...newLine[i]!,
          value: mergedValue,
          isMerged: true,
        };
        score += mergedValue;
        newLine.splice(i + 1, 1);
        newLine.push(null);
      }
    }
  } else {
    for (let i = 3; i > 0; i--) {
      if (
        newLine[i] !== null &&
        newLine[i - 1] !== null &&
        newLine[i]!.value === newLine[i - 1]!.value &&
        !newLine[i]!.isMerged &&
        !newLine[i - 1]!.isMerged
      ) {
        const mergedValue = (newLine[i]!.value * 2) as TileValue;
        newLine[i] = {
          ...newLine[i]!,
          value: mergedValue,
          isMerged: true,
        };
        score += mergedValue;
        newLine.splice(i - 1, 1);
        newLine.unshift(null);
        i++;
      }
    }
  }

  if (JSON.stringify(newLine) !== JSON.stringify(originalLine)) {
    hasChanged = true;
  }

  return { line: newLine, score, changed: hasChanged };
}

export function checkGameOver(tiles: Tile[]): boolean {
  const grid: Array<Array<Tile | null>> = [];
  for (let i = 0; i < 4; i++) {
    grid[i] = [null, null, null, null];
  }

  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile;
  });

  const isFull = tiles.length === 16;

  if (!isFull) {
    return false;
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = grid[row][col];
      if (current === null) return false;

      if (col < 3 && grid[row][col + 1] && current.value === grid[row][col + 1]!.value) {
        return false;
      }

      if (row < 3 && grid[row + 1][col] && current.value === grid[row + 1][col]!.value) {
        return false;
      }
    }
  }

  return true;
}

export function checkWin(tiles: Tile[]): boolean {
  return tiles.some((tile) => tile.value >= 2048);
}

export function clearMergedAndNewFlags(tiles: Tile[]): Tile[] {
  return tiles.map((tile) => ({
    ...tile,
    isMerged: false,
    isNew: false,
  }));
}
