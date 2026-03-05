// store/unreadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ==========================
// Async thunks
// ==========================
export const fetchUnreadCounts = createAsyncThunk(
  'unread/fetchUnreadCounts',
  async (_, { rejectWithValue }) => {
    try {
      const [chatRes, notifRes] = await Promise.all([
        api.get('/me/unread-chats-count'),
        api.get('/me/unread-notifications-count')
      ]);

      return {
        unreadChats: chatRes.data.unreadChats || 0,
        unreadNotifications: notifRes.data.unreadNotifications || 0
      };
    } catch (err) {
      console.error('❌ fetchUnreadCounts error:', err);
      return rejectWithValue(err.response?.data || { error: 'Failed to fetch unread counts' });
    }
  }
);

// ==========================
// Slice
// ==========================
const unreadSlice = createSlice({
  name: 'unread',
  initialState: {
    unreadChats: 0,
    unreadNotifications: 0,
    loading: false,
    error: null
  },
  reducers: {
    setUnreadChats: (state, action) => {
      state.unreadChats = action.payload;
    },
    incrementUnreadChats: state => {
      state.unreadChats += 1;
    },
    decrementUnreadChats: state => {
      state.unreadChats = Math.max(0, state.unreadChats - 1);
    },
    setUnreadNotifications: (state, action) => {
      state.unreadNotifications = action.payload;
    },
    incrementUnreadNotifications: state => {
      state.unreadNotifications += 1;
    },
    decrementUnreadNotifications: state => {
      state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUnreadCounts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadChats = action.payload.unreadChats;
        state.unreadNotifications = action.payload.unreadNotifications;
      })
      .addCase(fetchUnreadCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch unread counts';
      });
  }
});

// ==========================
// Exports
// ==========================
export const {
  setUnreadChats,
  incrementUnreadChats,
  decrementUnreadChats,
  setUnreadNotifications,
  incrementUnreadNotifications,
  decrementUnreadNotifications
} = unreadSlice.actions;

export default unreadSlice.reducer;
