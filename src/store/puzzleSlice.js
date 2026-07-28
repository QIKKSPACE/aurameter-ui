import { createSlice } from "@reduxjs/toolkit";
import { generatePuzzle } from "../engine/puzzleGenerator";
import { calculateLevelReward } from "../utils/numberGameProgression";

const createInitialPuzzle = () => generatePuzzle(1);

const initialPuzzle = createInitialPuzzle();

const initialState = {
  level: 1,
  score: 0,
  completedLevels: 0,
  hintUsed: false,
  lastReward: 0,
  puzzle: initialPuzzle,
};

const buildNextPuzzle = (level) => generatePuzzle(level);

const puzzleSlice = createSlice({
  name: "mathPuzzle",
  initialState,
  reducers: {
    setPuzzle(state, action) {
      state.puzzle = action.payload || buildNextPuzzle(state.level);
    },

    updateCellValue(state, action) {
      const { cellId, value } = action.payload;

      if (!state.puzzle || !state.puzzle.cells[cellId]) return;

      const cell = state.puzzle.cells[cellId];
      if (!cell.editable) return;

      const min = state.puzzle.digitRange?.min ?? 0;
      const max = state.puzzle.digitRange?.max ?? 9999;

      if (value === null || value === "") {
        cell.value = null;
        return;
      }

      cell.value = Math.min(Math.max(Number(value) || 0, min), max);
    },

    takeHint(state, action) {
      const { cellId, value } = action.payload || {};
      if (!state.puzzle || !state.puzzle.cells[cellId]) return;

      const cell = state.puzzle.cells[cellId];
      if (!cell.editable) return;

      cell.value = value ?? cell.solution ?? null;
      state.hintUsed = true;
    },

    completeLevel(state) {
      const equationCount = state.puzzle?.equations?.length || 0;
      const reward = calculateLevelReward({
        score: state.score,
        equationCount,
        hintUsed: state.hintUsed,
      });

      state.lastReward = reward;
      state.score += reward;
      state.completedLevels += 1;
      state.level += 1;
      state.hintUsed = false;
      state.puzzle = buildNextPuzzle(state.level);
    },

    retryLevel(state) {
      state.hintUsed = false;
      state.lastReward = 0;
      state.puzzle = buildNextPuzzle(state.level);
    },
 setScore(state, action) {
      state.score = action.payload ?? 0;
    },
     setLoginLevel(state, action) {
      state.level = action.payload ?? 0;
    },
    resetProgress(state) {
      state.level = 1;
      state.score = 0;
      state.completedLevels = 0;
      state.hintUsed = false;
      state.lastReward = 0;
      state.puzzle = buildNextPuzzle(1);
    },
  },
});

export const {
  setPuzzle,
  updateCellValue,
  takeHint,
  completeLevel,
  retryLevel,
  resetProgress,
  setScore,
  setLoginLevel,
} = puzzleSlice.actions;

export default puzzleSlice.reducer;
