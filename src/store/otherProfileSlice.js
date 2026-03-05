// store/slices/otherProfileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunk to fetch user by ID
export const fetchOtherProfile = createAsyncThunk(
  "otherProfile/fetchUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/auth/getUser/${userId}`);
      return res.data?.user;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const otherProfileSlice = createSlice({
  name: "otherProfile",
  initialState: {
    user: null,
    userId: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOtherProfile: (state) => {
      state.user = null;
      state.userId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOtherProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOtherProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userId = action.payload?.id;
      })
      .addCase(fetchOtherProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
      });
  },
});

export const { clearOtherProfile } = otherProfileSlice.actions;
export default otherProfileSlice.reducer;
  