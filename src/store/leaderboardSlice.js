// store/leaderboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api"; // your api instance

// ---------------- Async Thunks ----------------

// Fetch leaderboard from API
export const fetchLeaderboard = createAsyncThunk(
  "leaderboard/fetch",
  async ({ type, campusId }, { rejectWithValue }) => {
    try {
      let url = "/leaderboard/";
      if (type === "global") url += "global";
      else if (type === "following") url += "following";
      else if (type === "campus") url += `campus/${campusId}`;

      const res = await api.get(url);
      return { type, data: res.data };
    } catch (err) {
      return rejectWithValue({ type, error: err.message || "Failed to fetch" });
    }
  }
); 

// ---------------- Initial State ----------------
const initialState = {
  global: {
    data: [],
    loading: false,
    selfRank: null,
    error: null,
    lastFetchedAt: null,
  },
  following: {
    data: [],
    loading: false,
    selfRank: null,
    error: null,
    lastFetchedAt: null,
  },
  campus: {
    data: [],
    loading: false,
    selfRank: null,
    error: null,
    lastFetchedAt: null,
    campusId: null, // track which campus we fetched
  },
};

// ---------------- Slice ----------------
const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    clearLeaderboard: (state, action) => {
      const type = action.payload;
      if (type && state[type]) {
        state[type] = { ...initialState[type] };
      } else {
        return initialState;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state, action) => {
        const { type } = action.meta.arg;
        if (state[type]) {
          state[type].loading = true;
          state[type].error = null;
        }
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
  const { type, data } = action.payload;
  if (state[type]) {
    state[type].loading = false;

    // leaderboard rows
    state[type].data = data.data || [];

    // ✅ store selfRank if present (following & campus)
    state[type].selfRank =
      typeof data.selfRank === "number" ? data.selfRank : null;

    state[type].lastFetchedAt = new Date().toISOString();

    if (type === "campus") {
      state.campus.campusId = action.meta.arg.campusId;
    }
  }
})
.addCase(fetchLeaderboard.rejected, (state, action) => {
  const leaderboardType = action.meta?.arg?.type;
  if (leaderboardType && state[leaderboardType]) {
    state[leaderboardType].loading = false;
    state[leaderboardType].error =
      action.payload?.error || action.error?.message || "Failed to fetch";
  }
});
  },
});

export const { clearLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
