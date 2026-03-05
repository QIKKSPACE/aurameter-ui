import { createSlice } from '@reduxjs/toolkit';
import { fetchMessages, syncGapMessages, syncMessages } from './messageThunks';


const PAGE_SIZE = 20;

/**
 * ==========================
 * Helpers
 * ==========================
 */
const processIncomingMessage = (chat, message,chatId) => {
  console.log(message)
  const seq = message.seq;
  if (seq == null) return;

  const lastSeq = chat.lastSeq ?? 0;
  const expectedSeq = lastSeq + 1;

  // 🟢 APP-LEVEL SYNC IS RUNNING
  if (chat.syncLoading && !chat.syncingGap) {
    chat.buffered.push(message);
    return;
  }
  if (seq === expectedSeq) {
    chat.lastSeq = seq;
    return;
  }

if (seq > expectedSeq) {
  chat.buffered.push(message);
  
  if (!chat.syncingGap) {
    chat.syncingGap = true;
    chat.gapRange = { from: expectedSeq, to: seq - 1 };

  }

  return;
}

  // seq <= lastSeq → ignore
};
/**
 * Ensure chat state exists
 */
const ensureChatState = (state, chatId) => {
  if (!state.messagesByChat[chatId]) {
    state.messagesByChat[chatId] = {
      messages: [],

      persistMessages: {
        messages: [],
        cursor: null,   // seq cursor (ONLY for sync)
        hasMore: true
      },

      lastSeq: null,    // highest seq seen (ONLY for sync)
      cursor: null,
      hasMore: true,

      isLoading: false,
      hasError: false,

      syncingGap: false,
      gapRange: null,
      buffered: [],
syncGapError:false,
      syncLoading: false,
      syncError: false
    };
  }
};

/**
 * Merge messages
 * - Deduplicate by local_id ONLY
 * - Sort by created_at ONLY
 */
const mergeMessages = (existing, incoming) => {
  const map = new Map();

  [...existing, ...incoming].forEach(message => {
    if (!message.local_id) return;
    map.set(message.local_id, message);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};

/**
 * Build persisted messages for fast reload
 */
const buildPersist = (chat, overrideHasMore = null) => {
  const sentMessages = chat.messages
    .filter(m => m.status === 'sent' && m.created_at)
    .slice(-PAGE_SIZE);

  return {
    messages: sentMessages,
    cursor: sentMessages[0]?.seq ?? null, // used only for sync
    hasMore: overrideHasMore ?? chat.hasMore
  };
};

/**
 * ==========================
 * Slice
 * ==========================
 */

const messageSlice = createSlice({
  name: 'messages',

  initialState: {
    messagesByChat: {}
  },

  reducers: {
    /**
     * Add optimistic message (before server reply)
     */
    addOptimisticMessage: (state, action) => {
      const { chatId, message } = action.payload;
      ensureChatState(state, chatId);

      const chat = state.messagesByChat[chatId];
      chat.messages = mergeMessages(chat.messages, [message]);
      chat.persistMessages = buildPersist(chat);
    },

    /**
     * Update message when server confirms
     */
    updateMessageStatus: (state, action) => {
      const { chatId, local_id, status, id, seq, created_at } = action.payload;
      ensureChatState(state, chatId);

      const chat = state.messagesByChat[chatId];
      const index = chat.messages.findIndex(m => m.local_id === local_id);
      if (index === -1) return;

      chat.messages[index] = {
        ...chat.messages[index],
        status,
        id,
        seq,
        created_at
      };

      chat.messages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      chat.persistMessages = buildPersist(chat);
      
  // ───── ENGINE (same message, no recreation) ─────
  if (seq == null) return;

  const lastSeq = chat.lastSeq ?? 0;
  const expectedSeq = lastSeq + 1;

  if (seq === expectedSeq) {
    chat.lastSeq = seq;
    return;
  }
if (seq > expectedSeq) {
  // push actual message object, not undefined
  chat.buffered.push(chat.messages[index]);

  if (!chat.syncingGap) {
    chat.syncingGap = true;
    chat.gapRange = { from: expectedSeq, to: seq - 1 };
  }
}
    },

    /**
     * Retry failed message
     */
    retryMessage: (state, action) => {
      const { chatId, local_id } = action.payload;
      ensureChatState(state, chatId);

      const chat = state.messagesByChat[chatId];
      const msg = chat.messages.find(m => m.local_id === local_id);
      if (msg) msg.status = 'pending';
    },

    /**
     * Message received from socket
     */
addSocketMessage: (state, action) => {
  const { chatId, message } = action.payload;
  ensureChatState(state, chatId);

  const chat = state.messagesByChat[chatId];

  // UI merge
  chat.messages = mergeMessages(chat.messages, [message]);
  chat.persistMessages = buildPersist(chat);

  // ───── ENGINE (same message, no recreation) ─────
  const seq = message.seq;
  if (seq == null) return;

  const lastSeq = chat.lastSeq ?? 0;
  const expectedSeq = lastSeq + 1;

  if (seq === expectedSeq) {
    chat.lastSeq = seq;
    return;
  }

  if (seq > expectedSeq) {
    chat.buffered.push(message);

    if (!chat.syncingGap) {
      chat.syncingGap = true;
      chat.gapRange = { from: expectedSeq, to: seq - 1 };
    }
  }
},
    /**
     * Clear all messages of a chat
     */
    clearChatMessages: (state, action) => {
      delete state.messagesByChat[action.payload];
    },

    /**
     * Remove a message (local delete)
     */
    removeMessage: (state, action) => {
      const { chatId, local_id } = action.payload;
      ensureChatState(state, chatId);

      state.messagesByChat[chatId].messages =
        state.messagesByChat[chatId].messages.filter(
          m => m.local_id !== local_id
        );
    },

    /**
     * Hydrate messages from persisted storage
     */
    hydrateChatMessages: (state, action) => {
      const { chatId, persist } = action.payload;
      ensureChatState(state, chatId);

      const chat = state.messagesByChat[chatId];
      chat.messages = persist.messages;
      chat.persistMessages = persist;
      chat.cursor = persist.cursor;
      chat.hasMore = true;
    },
  
  },

  extraReducers: builder => {
    builder

      /**
       * ======================
       * FETCH HISTORY
       * ======================
       */
      .addCase(fetchMessages.pending, (state, action) => {
        ensureChatState(state, action.meta.arg.chatId);
        state.messagesByChat[action.meta.arg.chatId].isLoading = true;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages, cursor, hasMore } = action.payload;
        ensureChatState(state, chatId);

        const chat = state.messagesByChat[chatId];
        chat.isLoading = false;

        if (!messages.length) {
          chat.hasMore = false;
          return;
        }

        chat.messages = mergeMessages(chat.messages, messages);

        const highestSeq = messages.at(-1)?.seq;
        if (highestSeq != null) {
          chat.lastSeq = Math.max(chat.lastSeq ?? 0, highestSeq);
        }

        chat.persistMessages = buildPersist(chat, hasMore);
        chat.cursor = cursor;
        chat.hasMore = hasMore;
      })

      .addCase(fetchMessages.rejected, (state, action) => {
        const chatId = action.meta?.arg?.chatId;
        if (!chatId) return;

        ensureChatState(state, chatId);
        state.messagesByChat[chatId].isLoading = false;
        state.messagesByChat[chatId].hasError = true;
      })

      /**
       * ======================
       * SYNC MISSING MESSAGES
       * ======================
       */
      .addCase(syncMessages.pending, (state, action) => {
        ensureChatState(state, action.meta.arg.chatId);
        state.messagesByChat[action.meta.arg.chatId].syncLoading = true;
        state.messagesByChat[action.meta.arg.chatId].syncError =false ;

      })

      .addCase(syncMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        ensureChatState(state, chatId);

        const chat = state.messagesByChat[chatId];
        chat.syncLoading = false;

        if (!messages.length) return;

        chat.messages = mergeMessages(chat.messages, messages);

        const highestSeq = messages.at(-1)?.seq;
        if (highestSeq != null) {
          chat.lastSeq = Math.max(chat.lastSeq ?? 0, highestSeq);
        }

        chat.persistMessages = buildPersist(chat);
        
      })

      .addCase(syncMessages.rejected, (state, action) => {
        const chatId = action.meta?.arg?.chatId;
        if (!chatId) return;

        ensureChatState(state, chatId);
        state.messagesByChat[chatId].syncLoading = false;
        state.messagesByChat[chatId].syncError = true;
      })
      
      /**
       * ======================
       * SYNC GAP MESSAGES
       * ======================
       */
     /**
 * ======================
 * SYNC GAP MESSAGES
 * ======================
 */
.addCase(syncGapMessages.pending, (state, action) => {
  const { chatId } = action.meta.arg;
  ensureChatState(state, chatId);

  // Mark that a gap sync request is in progress
  state.messagesByChat[chatId].syncingGap = true;
  state.messagesByChat[chatId].syncError = false;
})

.addCase(syncGapMessages.fulfilled, (state, action) => {
  const { chatId, messages } = action.payload;
  ensureChatState(state, chatId);

  const chat = state.messagesByChat[chatId];

  // Done syncing this gap
  chat.syncingGap = false;

  if (!messages.length) return;

  // Merge newly synced messages
  chat.messages = mergeMessages(chat.messages, messages);

  // Update lastSeq
  const highestSeq = messages.at(-1)?.seq;
  if (highestSeq != null) chat.lastSeq = Math.max(chat.lastSeq ?? 0, highestSeq);

  // --- Sort buffered before processing ---
  chat.buffered.sort((a, b) => a.seq - b.seq);

  // Process buffered messages
  let i = 0;
  while (i < chat.buffered.length) {
    const bufferedMsg = chat.buffered[i];
    const expectedSeq = (chat.lastSeq ?? 0) + 1;

    if (bufferedMsg.seq === expectedSeq) {
      chat.messages = mergeMessages(chat.messages, [bufferedMsg]);
      chat.lastSeq = bufferedMsg.seq;
      chat.buffered.splice(i, 1);
    } else if (bufferedMsg.seq > expectedSeq) {
      chat.syncingGap = true;
      chat.gapRange = { from: expectedSeq, to: bufferedMsg.seq - 1 };
      break;
    } else {
      chat.buffered.splice(i, 1);
    }
  }
})

.addCase(syncGapMessages.rejected, (state, action) => {
  const { chatId } = action.meta.arg;
  if (!chatId) return;

  ensureChatState(state, chatId);

  // Reset gap syncing flag and mark error
  state.messagesByChat[chatId].syncingGap = false;
  state.messagesByChat[chatId].syncGapError = true;
});

  }
});

export const {
  clearChatMessages,
  hydrateChatMessages,
  addOptimisticMessage,
  updateMessageStatus,
  addSocketMessage,
  retryMessage,
  removeMessage,
  
} = messageSlice.actions;

export default messageSlice.reducer;
