import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "../services/api";

/**
 * ==========================
 * Async Thunks
 * ==========================
 */

export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/chats");
      return response.data.chats || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: "Failed to fetch chats" }
      );
    }
  }
);

/**
 * ==========================
 * Helpers
 * ==========================
 */

// Ordering chats by last message seq (highest first)
const getChatOrderSeq = (chat) => {
  if (chat.last_message_seq != null) return chat.last_message_seq;
  if (chat.last_seq != null) return chat.last_seq;
  return 0;
};

/**
 * ==========================
 * Selector
 * ==========================
 */
export const selectMessageBootstrapBatch = createSelector(
  [
    (state) => state.chats.chats,
    (state) => state.chats.messageBootstrapPage,
    (state) => state.chats.pageSize,
    (state) => state.messages.messagesByChat,
  ],
  (chats, page, pageSize, messagesByChat) => {
    const start = page * pageSize;
    const end = start + pageSize;

    return chats
      .slice(start, end)
      // ignore chats with no messages on server
      .filter(chat => chat.last_message_seq != null)
      .map(chat => {
        const chatState = messagesByChat[chat.chat_id];

        // 1️⃣ No local state → FETCH
        if (!chatState || !chatState.messages.length) {
          return {
            type: "FETCH",
            chatId: chat.chat_id,
            cursor: null,
          };
        }

        const clientLastSeq = chatState.lastSeq;
        const serverLastSeq = chat.last_message_seq;

        // 2️⃣ Client is behind → SYNC
        if (
          clientLastSeq == null ||
          serverLastSeq > clientLastSeq
        ) {
          return {
            type: "SYNC",
            chatId: chat.chat_id,
            since: clientLastSeq,
          };
        }

        // 3️⃣ Up to date → do nothing
        return null;
      })
      .filter(Boolean);
  }
);
/**
 * ==========================
 * Slice
 * ==========================
 */

const chatSlice = createSlice({
  name: "chat",

  initialState: {
    chats: [],
    currently_active_chat_id: null,
    chatsFetchedFromServer: false,
    messageBootstrapPage: 0,
    pageSize: 10,
    loading: false,
    error: null,
    lastFetchedAt: null,
  },

  reducers: {
    upsertChat: (state, action) => {
      const incomingChat = action.payload;
      const chatId = incomingChat.chat_id;

      state.chats = state.chats.filter(c => c.chat_id !== chatId);

      const insertIndex = state.chats.findIndex(
        (c) => getChatOrderSeq(incomingChat) > getChatOrderSeq(c)
      );

      if (insertIndex === -1) {
        state.chats.push(incomingChat);
      } else {
        state.chats.splice(insertIndex, 0, incomingChat);
      }
    },

    updateChatLastMessage: (state, action) => {
  const { chat_id, message } = action.payload;
  if (!message || !message.created_at) return; // must have timestamp

  const chatIndex = state.chats.findIndex(c => c.chat_id === chat_id);
  if (chatIndex === -1) return;

  const chat = state.chats[chatIndex];

  // Only update if the new message is newer than the current last_message_at
  if (chat.last_message_at != null && new Date(message.created_at) <= new Date(chat.last_message_at)) return;

  const updatedChat = {
    ...chat,
    last_message_id: message.id,
    last_message_by: message.sender_id,
    last_message_type: message.message_type,
    last_message_content: message.content,
    last_message_file_url: message.file_url,
    last_message_replying_to: message?.replying_to,
    last_message_seq: message.seq,            // keep seq for message system
    last_message_at: message.created_at,      // use for sorting
  };

  // Remove old chat
  state.chats.splice(chatIndex, 1);

  // Insert in correct position sorted by last_message_at
  const insertIndex = state.chats.findIndex(c => {
    const aTime = new Date(updatedChat.last_message_at);
    const bTime = new Date(c.last_message_at || c.activated_at);
    return aTime > bTime; // newest first
  });

  if (insertIndex === -1) {
    state.chats.push(updatedChat);
  } else {
    state.chats.splice(insertIndex, 0, updatedChat);
  }
},


    setActiveChat: (state, action) => {
      state.currently_active_chat_id = action.payload;
    },
    clearActiveChat: (state) => {
      state.currently_active_chat_id = null;
    },
    advanceMessageBootstrapPage: (state) => {
      state.messageBootstrapPage += 1;
    },

    removeChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter(c => c.chat_id !== chatId);
      if (state.currently_active_chat_id === chatId) state.currently_active_chat_id = null;
    },

    updateChatLastReadAt: (state, action) => {
  const { chat_id, last_read_at, last_seen_seq } = action.payload;

  const chat = state.chats.find(c => c.chat_id === chat_id);
  if (!chat) return;

  // ---------- last_read_at ----------
  if (
    last_read_at != null &&
    (chat.last_read_at == null || last_read_at > chat.last_read_at)
  ) {
    chat.last_read_at = last_read_at;
  }

  // ---------- last_read_seq ----------
  if (last_seen_seq != null) {
    const incomingSeq = Number(last_seen_seq);
    const currentSeq = Number(chat.last_seen_seq) || 0;

    if (incomingSeq > currentSeq) {
      chat.last_seen_seq = incomingSeq;
    }
  }
},


    clearChatError: (state) => {
      state.error = null;
    },

    addNewChat: (state, action) => {
      const { chat } = action.payload;
      if (!chat?.chat_id) return;

      state.chats = state.chats.filter(c => c.chat_id !== chat.chat_id);

      const insertIndex = state.chats.findIndex(
        (c) => getChatOrderSeq(chat) > getChatOrderSeq(c)
      );

      if (insertIndex === -1) state.chats.push(chat);
      else state.chats.splice(insertIndex, 0, chat);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(fetchChats.fulfilled, (state, action) => {
  state.loading = false;
  state.lastFetchedAt = new Date().toISOString();

  // Sort chats before storing
  const chats = action.payload.sort((a, b) => {
    const aTime = a.last_message_at || a.activated_at;
    const bTime = b.last_message_at || b.activated_at;
    return new Date(bTime) - new Date(aTime); // newest first
  });

  state.chats = chats;
  state.chatsFetchedFromServer = true;
})
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch chats";
      });
  },
});

/**
 * ==========================
 * Exports
 * ==========================
 */

export const {
  upsertChat,
  updateChatLastMessage,
  setActiveChat,
  clearActiveChat,
  removeChat,
  clearChatError,
  updateChatLastReadAt,
  addNewChat,
  advanceMessageBootstrapPage,
} = chatSlice.actions;

export default chatSlice.reducer;
