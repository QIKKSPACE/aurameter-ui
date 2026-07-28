import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getLevelById } from '../games/kenken/LevelConfig';
import { initializeGrid, setCellNotes, setCellValue } from '../games/kenken/KenKenEngine';
import type { CellState, GridCoord, KenKenLevel } from '../games/kenken/KenKenTypes';

type KenKenLevelState = {
  grid: CellState[][];
  selectedCell: GridCoord | null;
  isCompleted: boolean;
  mistakesCount: number;
  isPencilMode: boolean;
  elapsedSeconds: number;
  hintsUsed: number;
  hintMessage: string | null;
  highlightedCells: GridCoord[];
  hintCellFlash: GridCoord | null;
  hasStarted: boolean;
  undoStack: CellState[][][];
  redoStack: CellState[][][];
};

type KenKenStoreState = {
  currentLevelId: number;
  totalScore: number;
  pendingReward: number;
  rewardedLevels: number[];
  levels: Record<number, KenKenLevelState>;
};

const createLevelState = (level: KenKenLevel): KenKenLevelState => ({
  grid: initializeGrid(level),
  selectedCell: null,
  isCompleted: false,
  mistakesCount: 0,
  isPencilMode: false,
  elapsedSeconds: 0,
  hintsUsed: 0,
  hintMessage: null,
  highlightedCells: [],
  hintCellFlash: null,
  hasStarted: false,
  undoStack: [],
  redoStack: [],
});

const ensureLevelState = (state: KenKenStoreState, levelId: number) => {
  const level = getLevelById(levelId);
  if (!level) return null;

  if (!state.levels[levelId]) {
    state.levels[levelId] = createLevelState(level);
  }

  return state.levels[levelId];
};

const initialState: KenKenStoreState = {
  currentLevelId: 1,
  totalScore: 0,
  pendingReward: 0,
  rewardedLevels: [],
  levels: {
    1: createLevelState(getLevelById(1)!),
  },
};

const kenKenSlice = createSlice({
  name: 'kenken',
  initialState,
  reducers: {
    setCurrentLevelId(state, action: PayloadAction<number>) {
      const nextLevelId = action.payload || 1;
      state.currentLevelId = nextLevelId;
      ensureLevelState(state, nextLevelId);
    },
    setLevelState(
      state,
      action: PayloadAction<{ levelId: number; levelState: Partial<KenKenLevelState> }>
    ) {
      const { levelId, levelState } = action.payload;
      const current = ensureLevelState(state, levelId);
      if (!current) return;
      Object.assign(current, levelState);
    },
    resetCurrentLevel(state) {
      const level = getLevelById(state.currentLevelId);
      if (!level) return;
      state.levels[state.currentLevelId] = createLevelState(level);
    },
    nextLevel(state) {
      const nextLevelId = state.currentLevelId + 1;
      state.currentLevelId = nextLevelId;
      ensureLevelState(state, nextLevelId);
    },
    selectCell(state, action: PayloadAction<GridCoord>) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level || level.isCompleted) return;

      const { row, col } = action.payload;
      if (!level.hasStarted && !level.grid[row][col].isGiven) {
        level.hasStarted = true;
      }

      level.selectedCell = { row, col };
    },
    inputDigit(state, action: PayloadAction<number>) {
      const level = ensureLevelState(state, state.currentLevelId);
      const levelConfig = getLevelById(state.currentLevelId);
      if (!level || !levelConfig || level.isCompleted || !level.selectedCell) return;

      const { row, col } = level.selectedCell;
      if (level.grid[row][col].isGiven) return;

      const currentValue = level.grid[row][col].value;
      let newGrid = [...level.grid];

      if (level.isPencilMode) {
        newGrid = setCellNotes(newGrid, row, col, action.payload);
      } else if (currentValue === action.payload) {
        newGrid = setCellValue(newGrid, row, col, null, levelConfig);
      } else {
        newGrid = setCellValue(newGrid, row, col, action.payload, levelConfig);
      }

      level.undoStack.push(level.grid);
      if (level.undoStack.length > 20) {
        level.undoStack.shift();
      }
      level.redoStack = [];
      level.grid = newGrid;
    },
    deleteCell(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      const levelConfig = getLevelById(state.currentLevelId);
      if (!level || !levelConfig || level.isCompleted || !level.selectedCell) return;

      const { row, col } = level.selectedCell;
      if (level.grid[row][col].isGiven) return;

      level.undoStack.push(level.grid);
      if (level.undoStack.length > 20) {
        level.undoStack.shift();
      }
      level.redoStack = [];
      level.grid = setCellValue([...level.grid], row, col, null, levelConfig);
    },
    togglePencil(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.isPencilMode = !level.isPencilMode;
    },
    undo(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level || level.undoStack.length === 0) return;

      const previousGrid = level.undoStack.pop();
      if (!previousGrid) return;

      level.redoStack.push(level.grid);
      if (level.redoStack.length > 20) {
        level.redoStack.shift();
      }
      level.grid = previousGrid;
    },
    redo(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level || level.redoStack.length === 0) return;

      const nextGrid = level.redoStack.pop();
      if (!nextGrid) return;

      level.undoStack.push(level.grid);
      if (level.undoStack.length > 20) {
        level.undoStack.shift();
      }
      level.grid = nextGrid;
    },
    clearCurrentLevel(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level || level.isCompleted) return;

      level.undoStack.push(level.grid);
      if (level.undoStack.length > 20) {
        level.undoStack.shift();
      }
      level.redoStack = [];
      level.grid = level.grid.map((row) =>
        row.map((cell) =>
          cell.isGiven
            ? cell
            : {
                ...cell,
                value: null,
                notes: [],
                isError: false,
                isHinted: false,
              }
        )
      );
      level.selectedCell = null;
    },
    incrementElapsedSeconds(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level || level.isCompleted || !level.hasStarted) return;
      level.elapsedSeconds += 1;
    },
    setHintMessage(state, action: PayloadAction<string | null>) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.hintMessage = action.payload;
    },
    setHighlightedCells(state, action: PayloadAction<GridCoord[]>) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.highlightedCells = action.payload;
    },
    setHintCellFlash(state, action: PayloadAction<GridCoord | null>) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.hintCellFlash = action.payload;
    },
    setHintUsage(state, action: PayloadAction<number>) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.hintsUsed = action.payload;
    },
    markCompleted(state) {
      const level = ensureLevelState(state, state.currentLevelId);
      if (!level) return;
      level.isCompleted = true;

      if (!state.rewardedLevels.includes(state.currentLevelId)) {
        state.rewardedLevels.push(state.currentLevelId);
        state.pendingReward += state.currentLevelId;
      }
    },
    collectReward(state) {
      if (state.pendingReward <= 0) return;
      state.totalScore += state.pendingReward;
      state.pendingReward = 0;
    },
    setTotalScore(state, action: PayloadAction<number>) {
      state.totalScore = action.payload;
    },
    setPendingReward(state, action: PayloadAction<number>) {
      state.pendingReward = action.payload;
    },
  },
});

export const {
  setCurrentLevelId,
  setLevelState,
  resetCurrentLevel,
  nextLevel,
  selectCell,
  inputDigit,
  deleteCell,
  togglePencil,
  undo,
  redo,
  clearCurrentLevel,
  incrementElapsedSeconds,
  setHintMessage,
  setHighlightedCells,
  setHintCellFlash,
  setHintUsage,
  markCompleted,
  collectReward,
  setTotalScore,
  setPendingReward,
} = kenKenSlice.actions;

const selectKenKenSlice = (state: { kenken?: KenKenStoreState }) => state.kenken;

export const selectKenKenStore = createSelector([selectKenKenSlice], (kenken) => {
  return (
    kenken ?? {
      ...initialState,
      levels: { ...initialState.levels },
    }
  );
});

export const selectKenKenCurrentGame = createSelector([selectKenKenStore], (kenken) => {
  const level = getLevelById(kenken.currentLevelId);
  if (!level) return null;

  const levelState = kenken.levels[kenken.currentLevelId] ?? createLevelState(level);

  return {
    level,
    grid: levelState.grid,
    selectedCell: levelState.selectedCell,
    isCompleted: levelState.isCompleted,
    mistakesCount: levelState.mistakesCount,
    isPencilMode: levelState.isPencilMode,
    elapsedSeconds: levelState.elapsedSeconds,
    hintsUsed: levelState.hintsUsed,
    hintMessage: levelState.hintMessage,
    highlightedCells: levelState.highlightedCells,
    hintCellFlash: levelState.hintCellFlash,
    hasStarted: levelState.hasStarted,
  };
});

export const selectKenKenTotals = createSelector([selectKenKenStore], (kenken) => ({
  currentLevelId: kenken.currentLevelId,
  totalScore: kenken.totalScore,
  pendingReward: kenken.pendingReward,
  rewardedLevels: kenken.rewardedLevels,
}));

export default kenKenSlice.reducer;
