import { createSlice } from '@reduxjs/toolkit';

const INITIAL_TIME_REMAINING = 120;

const initialState = {
  puzzle: null,
  currentPath: [{ row: 0, col: 0 }],
  pathStatus: 'idle',
  currentResult: null,
  playerScore: 0,
  highScore: 0,
  timeRemaining: INITIAL_TIME_REMAINING,
  roundsCompleted: 0,
  isGameOver: false,
};

const mathMazeSlice = createSlice({
  name: 'mathMaze',
  initialState,
  reducers: {
    setPuzzle(state, action) {
      state.puzzle = action.payload;
      state.currentPath = [{ row: 0, col: 0 }];
      state.pathStatus = 'idle';
      state.currentResult = null;
      state.isGameOver = false;
    },

    setCurrentPath(state, action) {
      state.currentPath = action.payload;
    },

    setPathStatus(state, action) {
      state.pathStatus = action.payload;
    },

    setCurrentResult(state, action) {
      state.currentResult = action.payload;
    },

    completeRound(state) {
      state.playerScore += 1;
      state.roundsCompleted += 1;
      state.highScore = Math.max(state.highScore, state.playerScore);
      state.pathStatus = 'correct';
    },

    resetPath(state) {
      state.currentPath = [{ row: 0, col: 0 }];
      state.pathStatus = 'idle';
      state.currentResult = null;
    },

    setTimeRemaining(state, action) {
      state.timeRemaining = action.payload;
      if (state.timeRemaining <= 0) {
        state.isGameOver = true;
      }
    },

    tickTime(state) {
      if (state.isGameOver || !state.puzzle) return;
      if (state.timeRemaining <= 1) {
        state.timeRemaining = 0;
        state.isGameOver = true;
        return;
      }

      state.timeRemaining -= 1;
    },

    setGameOver(state, action) {
      state.isGameOver = action.payload;
    },

    collectReward(state) {
      state.playerScore = 0;
    },

    restartGame(state, action) {
      const puzzle = action.payload;
      state.puzzle = puzzle;
      state.currentPath = [{ row: 0, col: 0 }];
      state.pathStatus = 'idle';
      state.currentResult = null;
      state.timeRemaining = INITIAL_TIME_REMAINING;
      state.roundsCompleted = 0;
      state.isGameOver = false;
    },
  },
});

export const {
  setPuzzle,
  setCurrentPath,
  setPathStatus,
  setCurrentResult,
  completeRound,
  resetPath,
  setTimeRemaining,
  tickTime,
  setGameOver,
  collectReward,
  restartGame,
} = mathMazeSlice.actions;

export default mathMazeSlice.reducer;
