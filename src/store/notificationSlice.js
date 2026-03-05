import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/* -------------------- ASYNC ACTIONS -------------------- */

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications");

      if (!res.data?.success) {
        return rejectWithValue("Failed to fetch notifications");
      }

      return res.data.notifications;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/notifications/markAllAsRead");

      if (!res.data?.success) {
        return rejectWithValue("Failed to mark notifications as read");
      }

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* -------------------- SLICE -------------------- */

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    loading: false,
    error: null,
    notifications: [],
    count: 0, // unread count
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ---------- */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.count = action.payload.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- MARK ALL AS READ ---------- */
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;

        state.notifications = state.notifications.map((n) => ({
          ...n,
          is_read: true,
        }));

        state.count = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = null;
      });
  },
});

export default notificationsSlice.reducer;
