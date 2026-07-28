import { createSlice } from "@reduxjs/toolkit";

const MAX_HINTS_PER_LEVEL = 2;

const formatLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialState = {
  currentLevelId: 1,
  completedLevelId: null,
  completedOn: null,
  score: 0,
  totalScore: 0,
  hintsUsed: 0,
  lastRewardedLevelId: null,
};

const zipSlice = createSlice({
  name: "zip",
  initialState,
  reducers: {
    setCurrentLevel(state, action) {
      const { levelId, hintsUsed = 0, isComplete = false } = action.payload;
      state.currentLevelId = levelId;
      state.completedLevelId = isComplete ? levelId : null;
      state.hintsUsed = hintsUsed;
    },

    setHintsUsed(state, action) {
      const hintsUsed = action.payload;
      state.hintsUsed = Math.min(MAX_HINTS_PER_LEVEL, Math.max(0, hintsUsed));
    },

    useHint(state) {
      if (state.hintsUsed >= MAX_HINTS_PER_LEVEL) return;
      state.hintsUsed += 1;
    },

    resetHints(state) {
      state.hintsUsed = 0;
    },

    completeLevel(state, action) {
      const { levelId, reward } = action.payload;
      const today = formatLocalDateKey();

      if (state.lastRewardedLevelId === levelId && state.completedOn === today) {
        return;
      }

      state.currentLevelId = levelId;
      state.completedLevelId = levelId;
      state.completedOn = today;
      state.score = reward;
      state.totalScore += reward;
      state.lastRewardedLevelId = levelId;
    },

    collectReward(state) {
      state.score = 0;
    },
   syncZipProgress(state, action) {
      const { level = 1, lastCompletedAt = null } = action.payload;
      const todayKey = formatLocalDateKey();
      const completedOnKey = lastCompletedAt
        ? formatLocalDateKey(new Date(lastCompletedAt))
        : null;
      const completedToday = completedOnKey === todayKey;
      const completedLevelId = Math.max(1, level - 1);

      state.completedOn = completedOnKey;
      state.completedLevelId = completedLevelId;

      // "level" is the next playable level sent by backend.
      // If the user already played today, keep them on the completed level.
      state.currentLevelId = completedToday ? completedLevelId : level;
    }
  },
});

export const {
  setCurrentLevel,
  setHintsUsed,
  useHint,
  resetHints,
  completeLevel,
  collectReward,
  syncZipProgress,
} = zipSlice.actions;

export const getZipTodayKey = formatLocalDateKey;
export const ZIP_MAX_HINTS_PER_LEVEL = MAX_HINTS_PER_LEVEL;
export const selectZipCurrentLevel = state =>
  state.zip.currentLevelId;
export default zipSlice.reducer;
