import { createSlice } from "@reduxjs/toolkit";
import { generatePuzzle } from "../engine/puzzleGenerator";

const initialState = {
  level: 1,
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

      cell.value = Math.min(Math.max(Number(value) || 0, min), max);
    },

    nextLevel(state) {
      state.level++;
      state.puzzle = generatePuzzle(state.level);
    },
  },
});

export const { setPuzzle, updateCellValue, nextLevel } = puzzleSlice.actions;
export default puzzleSlice.reducer;
