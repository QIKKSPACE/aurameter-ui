import type { CellState, Cage, KenKenLevel, GridCoord, CageBorders, KenKenOperation } from './KenKenTypes';

export const initializeGrid = (level: KenKenLevel): CellState[][] => {
  const grid: CellState[][] = Array(level.gridSize)
    .fill(null)
    .map(() => Array(level.gridSize).fill(null));

  for (let row = 0; row < level.gridSize; row++) {
    for (let col = 0; col < level.gridSize; col++) {
      grid[row][col] = {
        value: null,
        notes: [],
        isGiven: false,
        isError: false,
        isSelected: false,
        isHinted: false,
        cageId: '',
      };
    }
  }

  for (const cage of level.cages) {
    for (const cell of cage.cells) {
      grid[cell.row][cell.col].cageId = cage.id;
      if (cage.operation === 'given' && cage.cells.length === 1 && level.id >= 13) {
        grid[cell.row][cell.col].value = cage.target;
        grid[cell.row][cell.col].isGiven = true;
      }
    }
  }

  return grid;
};

export const formatCageLabel = (cage: Cage): string => {
  if (cage.operation === 'given') {
    return cage.target.toString();
  }
  const opMap: Record<KenKenOperation, string> = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '/',
    given: '',
  };
  return `${opMap[cage.operation]}${cage.target}`;
};

export const getCageTopLeftCell = (cage: Cage): GridCoord => {
  let topLeft = cage.cells[0];
  for (const cell of cage.cells) {
    if (cell.row < topLeft.row || (cell.row === topLeft.row && cell.col < topLeft.col)) {
      topLeft = cell;
    }
  }
  return topLeft;
};

export const getCageBorders = (level: KenKenLevel, row: number, col: number): CageBorders => {
  const currentCageId = level.cages.find((cage) =>
    cage.cells.some((c) => c.row === row && c.col === col)
  )?.id;

  const borders: CageBorders = {
    top: row === 0,
    right: col === level.gridSize - 1,
    bottom: row === level.gridSize - 1,
    left: col === 0,
  };

  if (row > 0) {
    const topCell = level.cages.find((cage) =>
      cage.cells.some((c) => c.row === row - 1 && c.col === col)
    )?.id;
    borders.top = topCell !== currentCageId;
  }

  if (col < level.gridSize - 1) {
    const rightCell = level.cages.find((cage) =>
      cage.cells.some((c) => c.row === row && c.col === col + 1)
    )?.id;
    borders.right = rightCell !== currentCageId;
  }

  if (row < level.gridSize - 1) {
    const bottomCell = level.cages.find((cage) =>
      cage.cells.some((c) => c.row === row + 1 && c.col === col)
    )?.id;
    borders.bottom = bottomCell !== currentCageId;
  }

  if (col > 0) {
    const leftCell = level.cages.find((cage) =>
      cage.cells.some((c) => c.row === row && c.col === col - 1)
    )?.id;
    borders.left = leftCell !== currentCageId;
  }

  return borders;
};

export const setCellValue = (
  grid: CellState[][],
  row: number,
  col: number,
  value: number | null,
  level: KenKenLevel
): CellState[][] => {
  const newGrid = grid.map((r) => [...r]);
  newGrid[row][col] = { ...newGrid[row][col], value };
  return validateAllErrors(newGrid, level);
};

export const setCellNotes = (
  grid: CellState[][],
  row: number,
  col: number,
  digit: number
): CellState[][] => {
  const newGrid = grid.map((r) => [...r]);
  const notes = [...newGrid[row][col].notes];
  const index = notes.indexOf(digit);
  if (index > -1) {
    notes.splice(index, 1);
  } else {
    notes.push(digit);
    notes.sort((a, b) => a - b);
  }
  newGrid[row][col] = { ...newGrid[row][col], notes };
  return newGrid;
};

export const validateAllErrors = (grid: CellState[][], level: KenKenLevel): CellState[][] => {
  const newGrid = grid.map((r) => [...r]);

  for (let row = 0; row < level.gridSize; row++) {
    for (let col = 0; col < level.gridSize; col++) {
      newGrid[row][col] = { ...newGrid[row][col], isError: false };
    }
  }

  for (let row = 0; row < level.gridSize; row++) {
    for (let col = 0; col < level.gridSize; col++) {
      const cell = newGrid[row][col];
      if (cell.value === null || cell.isGiven) continue;

      let hasError = false;

      for (let c = 0; c < level.gridSize; c++) {
        if (c !== col && newGrid[row][c].value === cell.value) {
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        for (let r = 0; r < level.gridSize; r++) {
          if (r !== row && newGrid[r][col].value === cell.value) {
            hasError = true;
            break;
          }
        }
      }

      if (hasError) {
        newGrid[row][col] = { ...newGrid[row][col], isError: true };
      }
    }
  }

  for (const cage of level.cages) {
    if (cage.operation !== 'given' && cage.cells.every((c) => newGrid[c.row][c.col].value !== null)) {
      if (!validateCage(cage, newGrid)) {
        for (const cell of cage.cells) {
          newGrid[cell.row][cell.col] = { ...newGrid[cell.row][cell.col], isError: true };
        }
      }
    }
  }

  return newGrid;
};

export const validateCage = (cage: Cage, grid: CellState[][]): boolean => {
  if (cage.cells.some((c) => grid[c.row][c.col].value === null)) {
    return true;
  }

  const values = cage.cells.map((c) => grid[c.row][c.col].value as number);

  switch (cage.operation) {
    case 'given':
      return values[0] === cage.target;
    case '+':
      return values.reduce((a, b) => a + b, 0) === cage.target;
    case '-':
      if (values.length !== 2) return false;
      return Math.abs(values[0] - values[1]) === cage.target;
    case '*':
      return values.reduce((a, b) => a * b, 1) === cage.target;
    case '/':
      if (values.length !== 2) return false;
      const max = Math.max(values[0], values[1]);
      const min = Math.min(values[0], values[1]);
      return max % min === 0 && max / min === cage.target;
    default:
      return false;
  }
};

export const isGridComplete = (grid: CellState[][], level: KenKenLevel): boolean => {
  for (let row = 0; row < level.gridSize; row++) {
    for (let col = 0; col < level.gridSize; col++) {
      if (grid[row][col].value === null || grid[row][col].isError) {
        return false;
      }
    }
  }

  for (const cage of level.cages) {
    if (!validateCage(cage, grid)) {
      return false;
    }
  }

  return true;
};

export const getHint = (grid: CellState[][], level: KenKenLevel): GridCoord | null => {
  const emptyCells: GridCoord[] = [];
  const errorCells: GridCoord[] = [];

  for (let row = 0; row < level.gridSize; row++) {
    for (let col = 0; col < level.gridSize; col++) {
      if (grid[row][col].value === null) {
        emptyCells.push({ row, col });
      } else if (grid[row][col].isError) {
        errorCells.push({ row, col });
      }
    }
  }

  if (errorCells.length > 0) {
    return errorCells[0];
  }

  if (emptyCells.length > 0) {
    return emptyCells[0];
  }

  return null;
};
