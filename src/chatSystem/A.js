// store/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from "../services/api";
import { getMessagesByChatId, markMessageSent, removeFromMessageQueue } from '../utils/messageQueue';
// ==========================
// Async thunks
// ==========================
export const fetchChats = createAsyncThunk(
'chat/fetchChats',
async (_, { rejectWithValue }) => {
try {
const response = await api.get('/chats');
const serverChats = response.data.chats;

// For each chat, get queued messages and merge
const chatsWithQueuedMessages = await Promise.all(
serverChats.map(async chat => {
// Get queued messages from local queue
const queuedMessages = await getMessagesByChatId(chat.chat_id);

// Combined messages = only queued messages for now
const combinedMessages = [...queuedMessages];

// Update chat's last_message_* fields based on last queued message
const lastMsg = combinedMessages[combinedMessages.length - 1];
const queuedTime =
lastMsg?.created_at     
? new Date(lastMsg.created_at)
: null

const serverTime =
chat.last_message_at
? new Date(chat.last_message_at)
: new Date(chat.activated_at);
const useQueued =queuedTime && (!serverTime || queuedTime > serverTime);

if (useQueued) {
chat.last_message_at = lastMsg.created_at;
chat.last_message_by = lastMsg.sender_id;
chat.last_message_content = lastMsg.content || '';
chat.last_message_type = lastMsg.message_type;
}

return { ...chat, messages: combinedMessages };
})
);

return chatsWithQueuedMessages;
} catch (err) {
console.error('❌ fetchChats error:', err);
return rejectWithValue(err.response?.data || { error: 'Failed to fetch chats' });
}
}
);


export const fetchMessages = createAsyncThunk(
'chat/fetchMessages',
async (chatId, { rejectWithValue }) => {
try {
// Fetch server messages
const response = await api.get(`/chats/${chatId}/messages`);
const serverMessages = response.data.messages;

// Get queued messages from file-based queue
const queuedMessages = await getMessagesByChatId(chatId);

// Remove any queued messages that already exist on server
const serverMessageIds = new Set(serverMessages.map(m => m.id));

for (const qMsg of queuedMessages) {
if (qMsg.local_id && serverMessageIds.has(qMsg.local_id)) {
await removeFromMessageQueue(qMsg.local_id);
}
}

// Merge server + remaining queued messages
const combinedMessages = [...serverMessages];
queuedMessages.forEach(qMsg => {
const exists = combinedMessages.find(
m => m.local_id === qMsg.local_id 
);
if (!exists) combinedMessages.push(qMsg);
});

// Sort by created_at ascending (oldest first)
combinedMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

return { chatId, messages: combinedMessages };
} catch (err) {
console.error('❌ fetchMessages error:', err);
return rejectWithValue(err.response?.data || { error: 'Failed to fetch messages' });
}
}
);

// ==========================
// Helpers
// ==========================
const insertOrUpdateChat = (state, chat) => {
const index = state.chats.findIndex(c => c.chat_id === chat.chat_id);

const updatedChat = { ...chat };

if (index >= 0) {
const existing = state.chats[index];

// Merge existing fields only if new ones are not null/undefined
for (const key in existing) {
if (existing[key] !== undefined && (updatedChat[key] === null || updatedChat[key] === undefined)) {
updatedChat[key] = existing[key];
}
}

state.chats[index] = updatedChat;

// Move chat to front
state.chats.splice(index, 1);
state.chats.unshift(updatedChat);
} else {
// Add new chat
state.chats.unshift(updatedChat);
}

// Ensure messages array exists
if (!state.messages[chat.chat_id]) state.messages[chat.chat_id] = [];

// Sort safely: treat null as older
state.chats.sort((a, b) => {
const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
return bTime - aTime;
});
};


const mergeQueueMessages = (serverMessages, queuedMessages) => {
const combined = [...serverMessages];
queuedMessages.forEach(qMsg => {
const exists = combined.find(m => m.local_id === qMsg.local_id || m.id === qMsg.id);
if (!exists) combined.push(qMsg);
});
return combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

// ==========================
// Chat slice
// ==========================
const chatSlice = createSlice({
name: 'chat',
initialState: {
chats: [],
messages: {},        // { [chatId]: [msg, msg...] } includes pending messages
loadingChats: false,
loadingMessages: {}, // { [chatId]: boolean }
error: null,
},
reducers: {
// Upsert chat 
upsertChat: (state, action) => {
insertOrUpdateChat(state, action.payload);
},
addNewChat: (state, action) => {
const chat = action.payload.chat;
insertOrUpdateChat(state, chat);
},

// Add message (optimistic UI)
addMessage: (state, action) => {
const { chatId, message } = action.payload;
if (!state.messages[chatId]) state.messages[chatId] = [];
const alreadyExists = state.messages[chatId].some(
m => m.local_id === message.local_id
);

if (alreadyExists) return;
// 👇 Always add newest message to the beginning
state.messages[chatId].unshift(message);

const chat = state.chats.find(c => c.chat_id === chatId);
if (chat) {
chat.last_message_at = message.created_at;
chat.last_message_by = message.sender_id;
chat.last_message_content = message.content || '';
chat.last_message_type = message.message_type;
}

state.chats.sort(
(a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
);
},

// Update message status (sent/failed)
updateMessageStatus: (state, action) => {
const { chatId, localId, status, serverId, fileUrl } = action.payload;
const messages = state.messages[chatId];
if (!messages) return;

const msgIndex = messages.findIndex(m => m.local_id === localId);
if (msgIndex >= 0) {
messages[msgIndex].status = status;           // 'sent' | 'failed'
if (serverId) messages[msgIndex].id = serverId;
if (fileUrl) messages[msgIndex].file_url = fileUrl; // update file_url if present
}
},


// Remove a chat and its messages
removeChat: (state, action) => {
const chatId = action.payload;
state.chats = state.chats.filter(c => c.chat_id !== chatId);
delete state.messages[chatId];
},

// Merge queued messages after reload
mergeQueuedMessages: (state, action) => {
const { chatId, queuedMessages } = action.payload;
if (!state.messages[chatId]) state.messages[chatId] = [];
state.messages[chatId] = mergeQueueMessages(state.messages[chatId], queuedMessages);
},
updateChatRead: (state, action) => {
const { chatId, lastReadAt } = action.payload; // lastReadAt = ISO string or new Date()
const chat = state.chats.find(c => c.chat_id === chatId);
if (chat) {
chat.last_read_at = lastReadAt;

// Optional: if last message is before lastReadAt, update chat sorting
state.chats.sort(
(a, b) => {
const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
return bTime - aTime;
}
);
}
},
},

extraReducers: builder => {
builder
// Fetch Chats
.addCase(fetchChats.pending, state => {
state.loadingChats = true;
state.error = null;
})
.addCase(fetchChats.fulfilled, (state, action) => {
state.loadingChats = false;
action.payload.forEach(chat => insertOrUpdateChat(state, chat));
})
.addCase(fetchChats.rejected, (state, action) => {
state.loadingChats = false;
state.error = action.payload?.error || 'Failed to fetch chats';
})

// Fetch Messages
.addCase(fetchMessages.pending, (state, action) => {
const chatId = action.meta.arg;
state.loadingMessages[chatId] = true;
state.error = null;
})
.addCase(fetchMessages.fulfilled, (state, action) => {
const { chatId, messages } = action.payload;
state.loadingMessages[chatId] = false;

// Set messages in state
state.messages[chatId] = messages;

// Update chat metadata based on last message
const lastMsg = messages[0];
const chat = state.chats.find(c => c.chat_id === chatId);
if (chat && lastMsg) {
chat.last_message_at = lastMsg.created_at;
chat.last_message_by = lastMsg.sender_id;
chat.last_message_content = lastMsg.content || '';
chat.last_message_type = lastMsg.message_type;
}

// Sort chats by last_message_at
state.chats.sort(
(a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
);
})
.addCase(fetchMessages.rejected, (state, action) => {
const chatId = action.meta.arg;
state.loadingMessages[chatId] = false;
state.error = action.payload?.error || 'Failed to fetch messages';
});
},
});

// ==========================
// Exports
// ==========================
export const { upsertChat,addNewChat,updateChatRead, addMessage, removeChat, setNewChat, updateMessageStatus, mergeQueuedMessages } = chatSlice.actions;

export default chatSlice.reducer;
