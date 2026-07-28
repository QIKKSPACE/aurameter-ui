import { createSlice } from '@reduxjs/toolkit';
import { createInitialState } from '../games/game2048/Game2048Engine';

const initialState = createInitialState();
initialState.highestRewardedTile = 0;

const AURA_REWARDS = {
  32: 1,
  64: 1, // Total: 2
  128: 2, // Total: 4
  256: 2, // Total: 6
  512: 2, // Total: 8
  1024: 1, // Total: 9
  2048: 1, // Total: 10
};

const game2048Slice = createSlice({
  name: 'game2048',
  initialState,
  reducers: {
    applyMove(state, action) {
      const { tiles, isWon, isGameOver, highestTile } = action.payload;

      state.tiles = tiles;
      state.moveCount += 1;

      if (typeof highestTile === 'number') {
        state.bestScore = Math.max(state.bestScore, highestTile);
        
        const currentHighest = state.highestRewardedTile || 0;
        if (highestTile > currentHighest) {
          const rewardKeys = Object.keys(AURA_REWARDS).map(Number).sort((a,b)=>a-b);
          for (let key of rewardKeys) {
            if (highestTile >= key && currentHighest < key) {
              state.score += AURA_REWARDS[key];
            }
          }
          state.highestRewardedTile = highestTile;
        }
      }

      if (isWon) {

        state.status = 'won';
      } else if (isGameOver && state.status !== 'continuing') {
        state.status = 'lost';
      } else if (state.status === 'continuing') {
        state.status = 'playing';
      } else if (state.status === 'playing') {
        state.status = 'playing';
      }
    },

    startNewGame(state) {
      const freshState = createInitialState();
      state.tiles = freshState.tiles;
      state.status = 'playing';
      state.moveCount = 0;
      state.bestScore = Math.max(state.bestScore, freshState.bestScore);
      state.highestRewardedTile = 0;
    },

    keepGoing(state) {
      if (state.status === 'won') {
        state.status = 'continuing';
      }
    },

    collectReward(state) {
      state.score = 0;
    },
  },
});

export const {
  applyMove,
  startNewGame,
  keepGoing,
  collectReward,
} = game2048Slice.actions;

export default game2048Slice.reducer;
