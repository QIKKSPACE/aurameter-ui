import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLevel: 1,
  maxLevelReached: 1,
  points: 0,
};

const wordGameSlice = createSlice({
  name: 'wordGame',
  initialState,

  reducers: {
    completeLevel: (state, action) => {
      const completedLevel =
        action.payload;

      state.currentLevel =
        completedLevel + 1;

      if (
        state.currentLevel >
        state.maxLevelReached
      ) {
        state.maxLevelReached =
          state.currentLevel;
      }

      state.points += 1;
    },

    setLevel: (state, action) => {
      const targetLevel =
        action.payload;

      if (
        targetLevel <=
        state.maxLevelReached
      ) {
        state.currentLevel =
          targetLevel;
      }
    },

    /**
     * NEW
     * SYNC FROM BACKEND
     */
    syncWordLevel: (
      state,
      action
    ) => {
      const level =
        Number(action.payload) || 1;

      state.currentLevel =
        level;

      if (
        level >
        state.maxLevelReached
      ) {
        state.maxLevelReached =
          level;
      }
    },

    resetProgress: (state) => {
      state.currentLevel = 1;
      state.maxLevelReached = 1;
      state.points = 0;
    },

    collectReward: (state) => {
      state.points = 0;
    },
  },
});

export const {
  completeLevel,
  setLevel,
  resetProgress,
  collectReward,
  syncWordLevel,
} = wordGameSlice.actions;

export const selectWordGameCurrentLevel =
  (state) =>
    state.wordGame.currentLevel;

export const selectWordGameMaxLevel =
  (state) =>
    state.wordGame.maxLevelReached;

export const selectWordGamePoints =
  (state) =>
    state.wordGame.points;

export default wordGameSlice.reducer;