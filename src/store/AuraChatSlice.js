import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api"; // your axios instance

// ---------------------
// CURSOR BASED FETCH   
// ---------------------
export const fetchAuraChats = createAsyncThunk(
  "auraChat/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const cursor = state.auraChat.messages[state.auraChat.messages.length - 1]?.id;
      const res = await api.get("/aurachat/fetchAuraChat", {
        params: cursor ? { cursor } : {},
      });

      return {
        messages: res.data.messages,
        nextCursor: res.data.nextCursor,
        hasMore: res.data.hasMore,
      };
    } catch (err) {
      return rejectWithValue(err.response || "Failed loading chats");
    }
  }
);
const toTimestamp = (value) => {
  if (!value) return 0;

  // Already ISO or numeric
  if (typeof value === "number") return value;

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  // Last resort (handles weird Android cases)
  return new Date(value).getTime() || 0;
};
const auraChatSlice = createSlice({
name: "auraChat",
initialState: {
messages: [],
lastChatId: null,
lastMessageTimestamp: null,
hasMore: true,
  messageIds: {},        // 
loading: false,
hasError: false,
errorMessage: "",

// New states for AI
aiThinking: false,
aiError: false,
responseError: false,

},

reducers: {
// ---------------------
// PREPEND NEW MESSAGE
// ---------------------
prependMessage: (state, action) => {
  const msg = action.payload;

  if (!state.messageIds) state.messageIds = {};

  // Deduplicate by server ID
  if (state.messageIds[msg.id]) return;

  state.messageIds[msg.id] = true;

  state.messages.unshift(msg);

  state.lastMessageTimestamp = msg.created_at;
},
markSeenByAiUpTo: (state, action) => {
  const { aiMessageCreatedAt } = action.payload;
  const aiTime = toTimestamp(aiMessageCreatedAt);

  state.messages = state.messages.map(msg => {
    const msgTime = toTimestamp(msg.created_at);

    if (
      msg.sender === "user" &&
      !msg.seen_by_ai &&
      msgTime <= aiTime
    ) {
      return { ...msg, seen_by_ai: true };
    }
    return msg;
  });
},   
// ---------------------
// RESET CHAT
// ---------------------
resetAuraChat: (state) => {
state.messages = [];
state.lastChatId = null;
state.lastMessageTimestamp = null;
state.hasMore = true;
state.loading = false;
state.hasError = false;
state.errorMessage = "";
state.aiThinking = false;
state.aiError = false;
state.responseError=false
},
    
// ---------------------
// NEW: AI STATES
// ---------------------
setAiThinking: (state, action) => {
state.aiThinking = action.payload;
},
setAiError: (state, action) => {
state.aiError = action.payload;
},
setresponseError: (state, action) => {
state.responseError = action.payload;
},
},

extraReducers: (builder) => {
builder
// Fetch pending
.addCase(fetchAuraChats.pending, (state) => {
state.loading = true;
  state.hasError = false;
  state.errorMessage = "";
  state.aiError = false;
  state.responseError = false;
  state.aiThinking=false
})

// Fetch success
.addCase(fetchAuraChats.fulfilled, (state, action) => {
  state.loading = false;
  state.hasError = false;
  state.errorMessage = "";
  state.aiError = false;
  state.responseError = false;

  const { messages, nextCursor, hasMore } = action.payload;

  if (!state.messageIds) {
    state.messageIds = {};
  }

  const newMessages = [];

  for (const msg of messages) {
    if (!state.messageIds[msg.id]) {
      state.messageIds[msg.id] = true;
      newMessages.push(msg);
    }
  }

  if (!state.messages.length) {
    // First load
    state.messages = newMessages;
  } else {
    // Pagination (older messages)
    state.messages = [...state.messages, ...newMessages];
  }

  state.lastChatId = nextCursor;
  state.hasMore = hasMore;

  if (state.messages.length > 0) {
    state.lastMessageTimestamp = state.messages[0].created_at;
  }
})
// Fetch error
.addCase(fetchAuraChats.rejected, (state, action) => {
state.loading = false;
state.hasError = true;
state.errorMessage = action.payload || "Something went wrong";
state.aiThinking=false,
state.aiError=false,
state.responseError=false
});
},
});

export const { prependMessage, resetAuraChat, setAiThinking, setAiError,setresponseError,markSeenByAiUpTo } = auraChatSlice.actions;
export default auraChatSlice.reducer;
