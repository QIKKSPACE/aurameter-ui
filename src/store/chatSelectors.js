import { createSelector } from "@reduxjs/toolkit";

export const makeSelectMessagesByChatId = (chatId) =>
  createSelector(
    (state) => state.chats.messages[chatId],
    (messages = []) => messages
  );
