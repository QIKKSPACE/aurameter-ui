import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLevel: 1,
};

const ballSortSlice = createSlice({
  name: 'ballSort',
  initialState,
  reducers: {
    nextLevel: (state) => {
      state.currentLevel += 1;
    },
    setLevel: (state, action) => {
      state.currentLevel = action.payload;
    },
  },
});

export const { nextLevel, setLevel } = ballSortSlice.actions;
export const selectBallSortLevel = (state) => state.ballSort?.currentLevel || 1;
export default ballSortSlice.reducer;
