export const useInboxUnread = (chat, messagesByChatId) => {
  const chatId = chat.chat_id;

  const localLastSeq =
    messagesByChatId?.[chatId]?.lastSeq ?? 0;

  const lastSeenSeq = chat.last_seen_seq ?? 0;

  const unreadCount = Math.max(0, localLastSeq - lastSeenSeq);

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
  };
};
