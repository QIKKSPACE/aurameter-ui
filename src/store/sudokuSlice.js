import { createSlice } from '@reduxjs/toolkit';

const MAX_HINTS = 5;

const initialState = {
  sudoku: [],
  answer: [],
  userCurrentPosition: [],
  updatedAt: null,
  totalTimeSpent: 0,
  total: 0,
  hintsTaken: 0,
  hasAnswerShown: false,
  previousAnswer: [],
  isFocused: true,
};

const sudokuSlice = createSlice({
  name: 'sudoku',
  initialState,
  reducers: {
    setPuzzle(state, action) {
      const { puzzle, solution, previousAnswer } = action.payload;

      state.sudoku = puzzle;
      state.answer = solution;
      state.userCurrentPosition = puzzle.map(row => [...row]);
      state.previousAnswer = previousAnswer || state.previousAnswer;
      state.updatedAt = Date.now();
      state.totalTimeSpent = 0;
      state.total = 0;
      state.hintsTaken = 0;
      state.hasAnswerShown = false;
    },

    updateCell(state, action) {
      const { row, col, value } = action.payload;

      state.userCurrentPosition[row][col] = value;
      state.updatedAt = Date.now();
      state.total += 1;
    },

    takeHint(state, action) {
      const { row, col } = action.payload;
      if (state.hintsTaken >= MAX_HINTS) return;
      if (row == null || col == null) return;

      state.userCurrentPosition[row][col] =
        state.answer[row][col];
      state.hintsTaken += 1;
      state.updatedAt = Date.now();
    },

    showAnswer(state) {
      state.userCurrentPosition = state.answer;
      state.hasAnswerShown = true;
    },

    incrementTime(state) {
      if (state.isFocused && !state.hasAnswerShown) {
        state.totalTimeSpent += 1;
      }
    },

    setFocusState(state, action) {
      state.isFocused = action.payload;
    },
  },
});

export const {
  setPuzzle,
  updateCell,
  takeHint,
  showAnswer,
  incrementTime,
  setFocusState,
} = sudokuSlice.actions;

export default sudokuSlice.reducer;
