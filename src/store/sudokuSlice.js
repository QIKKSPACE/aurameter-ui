import { createSlice } from '@reduxjs/toolkit';

const MAX_HINTS = 5;

const ensureNotesGrid = (state) => {
  if (!Array.isArray(state.notes)) {
    state.notes = [];
  }
};

const ensureNotesCell = (state, row, col) => {
  ensureNotesGrid(state);
  if (!state.notes[row]) {
    state.notes[row] = Array.from({ length: 9 }, () => []);
  }
  if (!Array.isArray(state.notes[row][col])) {
    state.notes[row][col] = [];
  }
};

const initialState = {
  sudoku: [],
  answer: [],
  userCurrentPosition: [],
  notes: [],
  updatedAt: null,
  totalTimeSpent: 0,
  total: 0,
  hintsTaken: 0,
  hasAnswerShown: false,
  previousAnswer: [],
  isFocused: true,
  rewardScore: 0,
  rewardGranted: false,
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
      state.notes = puzzle.map(() => Array.from({ length: 9 }, () => []));
      state.previousAnswer = previousAnswer || state.previousAnswer;
      state.updatedAt = Date.now();
      state.totalTimeSpent = 0;
      state.total = 0;
      state.hintsTaken = 0;
      state.hasAnswerShown = false;
      state.rewardGranted = false;
    },

    updateCell(state, action) {
      const { row, col, value } = action.payload;
      ensureNotesCell(state, row, col);

      state.userCurrentPosition[row][col] = value;
      if (value !== 0) {
        state.notes[row][col] = [];
      }
      state.updatedAt = Date.now();
      state.total += 1;
    },

    toggleNote(state, action) {
      const { row, col, value } = action.payload;
      if (state.sudoku[row]?.[col] !== 0) return;
      if (value == null || value < 1 || value > 9) return;
      ensureNotesCell(state, row, col);

      const currentNotes = state.notes[row][col] || [];
      const hasNote = currentNotes.includes(value);
      state.notes[row][col] = hasNote
        ? currentNotes.filter((note) => note !== value)
        : [...currentNotes, value].sort((a, b) => a - b);
      state.updatedAt = Date.now();
    },

    clearNotes(state, action) {
      const { row, col } = action.payload;
      ensureNotesCell(state, row, col);
      state.notes[row][col] = [];
      state.updatedAt = Date.now();
    },

    takeHint(state, action) {
      const { row, col } = action.payload;
      if (state.hintsTaken >= MAX_HINTS) return;
      if (row == null || col == null) return;
      ensureNotesCell(state, row, col);

      state.userCurrentPosition[row][col] =
        state.answer[row][col];
      state.notes[row][col] = [];
      state.hintsTaken += 1;
      state.updatedAt = Date.now();
    },

    showAnswer(state) {
      state.userCurrentPosition = state.answer;
      state.hasAnswerShown = true;
    },

    awardCompletionReward(state) {
      if (state.rewardGranted) return;
      state.rewardScore += 10;
      state.rewardGranted = true;
      state.updatedAt = Date.now();
    },

    collectReward(state) {
      state.rewardScore = 0;
      state.updatedAt = Date.now();
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

const sudokuActions = sudokuSlice.actions;

export const setPuzzle = sudokuActions.setPuzzle;
export const updateCell = sudokuActions.updateCell;
export const toggleNote = sudokuActions.toggleNote;
export const clearNotes = sudokuActions.clearNotes;
export const takeHint = sudokuActions.takeHint;
export const showAnswer = sudokuActions.showAnswer;
export const awardCompletionReward = sudokuActions.awardCompletionReward;
export const collectReward = sudokuActions.collectReward;
export const incrementTime = sudokuActions.incrementTime;
export const setFocusState = sudokuActions.setFocusState;

export default sudokuSlice.reducer;
