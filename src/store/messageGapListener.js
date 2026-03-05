import { createListenerMiddleware } from '@reduxjs/toolkit';
import { addSocketMessage, updateMessageStatus } from './messageSlice';
import { syncGapMessages, syncMessages } from './messageThunks';

export const messageGapListener = createListenerMiddleware();

messageGapListener.startListening({
  matcher: action =>
    addSocketMessage.match(action) ||
    updateMessageStatus.match(action),

  effect: async (action, api) => {
    const { chatId } = action.payload;
    console.log(chatId)
    const state = api.getState();
    const chat = state.messages.messagesByChat[chatId];

    if (!chat) return;

    // 🛑 HARD GUARDS (these protect your brain)
    if (!chat.syncingGap) return;
    if (chat.syncLoading) return;
    if (!chat.gapRange) return;
  console.log('[GAP LISTENER] Triggered for chatId:', chatId);
  console.log('[GAP LISTENER] Gap range:', chat.gapRange);
  console.log('[GAP LISTENER] Buffered messages:', chat.buffered);
    api.dispatch(
      syncGapMessages({
        chatId,
        seqStart: chat.gapRange.from,
        seqEnd: chat.gapRange.to
      })
    );
  }
});
