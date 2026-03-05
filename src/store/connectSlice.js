// store/connectSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api"; // your api instance

// ---------------- Async Thunks ----------------

// Fetch connections from API
export const fetchConnections = createAsyncThunk(
  "connect/fetch",
  async ({ type }, { rejectWithValue }) => {
    try {
      let url = "/connect/";
      if (type === "following") url += "following";
      else if (type === "followers") url += "followers";
      else if (type === "connections") url += "connections";

      const res = await api.get(url);
      return { type, data: res.data };
    } catch (err) {
        console.log(err)
      return rejectWithValue({ type, error: err.message || "Failed to fetch" });
    }
  }
);

// ---------------- Initial State ----------------
const initialState = {
  following: {
    data: [],
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
  followers: {
    data: [],
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
  connections: {
    data: [],
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
};

// ---------------- Slice ----------------
const connectSlice = createSlice({
  name: "connect",
  initialState,
  reducers: {
    clearConnections: (state, action) => {
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
      .addCase(fetchConnections.pending, (state, action) => {
        const { type } = action.meta.arg;
        if (state[type]) {
          state[type].loading = true;
          state[type].error = null;
        }
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        if (state[type]) {
          state[type].loading = false;
          state[type].data = data || [];
          state[type].lastFetchedAt = new Date().toISOString();
        }
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        const type = action.meta?.arg?.type;
        if (type && state[type]) {
          state[type].loading = false;
          state[type].error =
            action.payload?.error || action.error?.message || "Failed to fetch";
        }
      });
  },
});

export const { clearConnections } = connectSlice.actions;
export default connectSlice.reducer;
