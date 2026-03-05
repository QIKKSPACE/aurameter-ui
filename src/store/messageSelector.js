import { createSelector } from "@reduxjs/toolkit";

const EMPTY_CHAT_STATE = {
  messages: [],
  cursor: null,
  hasMore: true,
  isLoading: false,
  hasError: false,
  syncLoading: false,
  syncError: false,
  lastSeq:null
};

const selectChatState = (state, chatId) =>
  state.messages.messagesByChat[chatId] ?? EMPTY_CHAT_STATE;

export const makeSelectMessagesWithMeta = () =>
  createSelector([selectChatState], (chatState) => ({
    messages: [...chatState.messages].reverse(), // reversed for UI
    cursor: chatState.cursor,
    hasMore: chatState.hasMore,
    isLoading: chatState.isLoading,
    hasError: chatState.hasError,
    syncLoading: chatState.syncLoading,
    syncError: chatState.syncError,
     lastSeq:chatState.lastSeq
  }));
