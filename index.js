/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from "@react-native-firebase/messaging";
import { store } from "./src/store/store";
import { addSocketMessage } from "./src/store/messageSlice";
import { updateChatLastMessage } from "./src/store/chatSlice";
import { markSeenByAiUpTo, prependMessage, setAiThinking } from './src/store/AuraChatSlice';
import { incrementUnreadChats } from './src/store/unreadSlice';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const data = remoteMessage.data || {};
  if (data.screen === "Messages" && data.fullMessage) {
    const parsed = JSON.parse(data.fullMessage);

    store.dispatch(addSocketMessage({
      chatId: data.chatId,
      message: parsed,
    }));
 const state = store.getState();
    const currentUserId = state.user.userData?.id;
    const chat = state.chats.chats.find(c => c.chat_id === data?.chatId);

    if (!chat) return;

    // Ignore self messages
    if (parsed?.sender_id === currentUserId) return;

    const lastSeenSeq = chat.last_seen_seq ?? 0;
    const lastMessageSeq = chat.last_message_seq ?? 0;
  
    /**
     * ✅ Chat already had unread messages IF
     * last_message_seq > last_seen_seq
     */
    const alreadyUnread = lastMessageSeq > lastSeenSeq;
   if (!alreadyUnread) {
      store.dispatch(incrementUnreadChats());
    }
    store.dispatch(updateChatLastMessage({
      chat_id: data.chatId,
      message: parsed,
    }));
  }
  if (data.screen === "AuraChat") {
     const payload={id: data?.messageId, text: data.message, sender: "aura", created_at: data?.createdAt}
            store.dispatch(setAiThinking(false));
          store.dispatch(prependMessage(payload));
          const aiCreatedAt =data?.createdAt;
          
          store.dispatch(markSeenByAiUpTo({aiMessageCreatedAt:aiCreatedAt}));
  return;
  }
});

AppRegistry.registerComponent(appName, () => App);

