import { createSlice } from "@reduxjs/toolkit";
import { generatePuzzle } from "../engine/puzzleGenerator";

const initialState = {
  level: 1,
  streak: 0,
  score: 0,
  completedLevels: 0,
  puzzle: generatePuzzle(1), // initial puzzle
};

const puzzleSlice = createSlice({
  name: "mathPuzzle",
  initialState,
  reducers: {
    setPuzzle(state, action) {
      state.puzzle = action.payload;
    },

    updateCellValue(state, action) {
      const { cellId, value } = action.payload;

      if (!state.puzzle || !state.puzzle.cells[cellId]) return;

      const cell = state.puzzle.cells[cellId];

      // ✅ Only editable cells can be updated
      if (!cell.editable) return;

      // ✅ Clamp value within puzzle digitRange
      const min = state.puzzle.digitRange?.min ?? 0;
      const max = state.puzzle.digitRange?.max ?? 9999;

      if (value === null || value === "") {
        cell.value = null;
        return;
      }

      cell.value = Math.min(Math.max(Number(value) || 0, min), max);
    },

    completeLevel(state) {
      state.completedLevels += 1;
      state.streak += 1;
      state.score += 10 + state.level + Math.min(state.streak, 10);
    },

    nextLevel(state) {
      state.level++;
      state.puzzle = generatePuzzle(state.level);
    },

    retryLevel(state) {
      state.streak = 0;
      state.puzzle = generatePuzzle(state.level);
    },
  },
});

export const {
  setPuzzle,
  updateCellValue,
  completeLevel,
  nextLevel,
  retryLevel,
} = puzzleSlice.actions;
export default puzzleSlice.reducer;
