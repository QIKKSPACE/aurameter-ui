export const shouldIncrementUnreadForMessage = (state, chatId, message) => {
  if (!chatId || !message) return false;

  const currentUserId = state.user.userData?.id;
  if (message.sender_id === currentUserId) return false;

  const activeChatId = state.chats.currently_active_chat_id;
  if (activeChatId === chatId) return false;

  const chat = state.chats.chats.find(c => c.chat_id === chatId);
  if (!chat) return false;

  const lastSeenSeq = Number(chat.last_seen_seq ?? 0);
  const lastMessageSeq = Number(chat.last_message_seq ?? 0);

  return lastMessageSeq <= lastSeenSeq;
};
