import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLevel: 1,
  pendingAura: 0,
  pendingRewardsByLevel: {},
};

const ensureBallSortState = (state) => {
  if (!state.pendingRewardsByLevel) {
    state.pendingRewardsByLevel = {};
  }

  if (typeof state.pendingAura !== 'number') {
    state.pendingAura = 0;
  }

  if (typeof state.currentLevel !== 'number' || state.currentLevel < 1) {
    state.currentLevel = 1;
  }
};

const ballSortSlice = createSlice({
  name: 'ballSort',
  initialState,
  reducers: {
    nextLevel: (state) => {
      ensureBallSortState(state);
      state.currentLevel += 1;
    },
    setLevel: (state, action) => {
      ensureBallSortState(state);
      state.currentLevel = action.payload;
    },
    queueLevelReward: (state, action) => {
      ensureBallSortState(state);

      const payload = action.payload || {};
      const level = Number(payload.level);
      const reward = Number(payload.reward ?? 0);

      if (!Number.isFinite(level) || level < 1 || reward <= 0) {
        return;
      }

      if (state.pendingRewardsByLevel[level]) {
        return;
      }

      state.pendingRewardsByLevel[level] = reward;
      state.pendingAura += reward;
    },
    claimPendingAura: (state) => {
      ensureBallSortState(state);
      state.pendingAura = 0;
      state.pendingRewardsByLevel = {};
    },
  },
});

export const { nextLevel, setLevel, queueLevelReward, claimPendingAura } = ballSortSlice.actions;
export const selectBallSortLevel = (state) => state.ballSort?.currentLevel || 1;
export const selectBallSortPendingAura = (state) => state.ballSort?.pendingAura || 0;
export const selectBallSortRewardQueuedForLevel = (state, level) =>
  Boolean(state.ballSort?.pendingRewardsByLevel?.[level]);
export default ballSortSlice.reducer;
