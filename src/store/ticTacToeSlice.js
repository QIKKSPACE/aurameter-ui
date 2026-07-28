import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  score: 0,
  aura: 0,
};

const ticTacToeSlice = createSlice({
  name: 'ticTacToe',
  initialState,
  reducers: {
    recordMatchResult(state, action) {
      const levelPoints = Number(action.payload?.levelPoints ?? 0);
      const outcome = action.payload?.outcome;

      if (!Number.isFinite(levelPoints) || levelPoints <= 0) {
        return;
      }

      if (outcome === 'win') {
        state.score += levelPoints;
        state.aura += levelPoints;
      } else if (outcome === 'lose') {
        state.score -= levelPoints;
        if (state.score < 0) {
          state.score = 0;
        }
      }
    },
    updateAura(state, action) {
      state.aura += action.payload;
      if (state.aura < 0) {
        state.aura = 0;
      }
    },
    claimAura(state) {
      state.aura = 0;
    },
  },
});

export const { recordMatchResult, updateAura, claimAura } = ticTacToeSlice.actions;

export default ticTacToeSlice.reducer;
