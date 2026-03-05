// src/hooks/useSockets.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../services/socketManager";
import {
  addNewChat,
  removeChat,
  updateChatLastMessage
} from "../store/chatSlice";
import { incrementUnreadChats } from "../store/unreadSlice";
import { markSeenByAiUpTo, prependMessage, setAiError, setAiThinking } from "../store/AuraChatSlice";
import { store } from "../store/store";
import { addSocketMessage } from "../store/messageSlice";

export const useSockets = () => {
  const dispatch = useDispatch();
const userdata = useSelector((state) => state.user);


useEffect(() => {
  if (!userdata?.refreshToken) return;

  let isMounted = true;

  (async () => {
    if (!isMounted) return;

    await getSocket("/aurachat", {
      "new-aura-reply": (data) => {
        console.log(data)
        if (data?.success) {
        dispatch(setAiThinking(false));
        const payload={id: data?.id, text: data.reply, sender: "aura", created_at: data?.createdAt}
        dispatch(prependMessage(payload));
        const aiCreatedAt =data?.createdAt;
        dispatch(markSeenByAiUpTo({aiMessageCreatedAt:aiCreatedAt}));
   
      }
      else
      {
          dispatch(setAiThinking(false));
          dispatch(setAiError(true));
      }
    }
    });

    await getSocket("/chat", {
  "receive-message": (data) => {
    if (!data?.success) return;

    const { chatId, message } = data;

    // 1️⃣ Add message
    dispatch(addSocketMessage({ chatId, message }));

    const state = store.getState();
    const currentUserId = state.user.userData?.id;
    const chat = state.chats.chats.find(c => c.chat_id === chatId);

    if (!chat) return;

    // Ignore self messages
    if (message.sender_id === currentUserId) return;

    const lastSeenSeq = chat.last_seen_seq ?? 0;
    const lastMessageSeq = chat.last_message_seq ?? 0;

    /**
     * ✅ Chat already had unread messages IF
     * last_message_seq > last_seen_seq
     */
    const alreadyUnread = lastMessageSeq > lastSeenSeq;

    // 2️⃣ Increment ONLY if this is the FIRST unread
    if (!alreadyUnread) {
      dispatch(incrementUnreadChats());
    }

    // 3️⃣ Update chat metadata LAST
    dispatch(updateChatLastMessage({
      chat_id: chatId,
      message
    }));
  }
});


    await getSocket("/follow_unfollow", {
      "follow_update": (data) => {
        if (!data?.success) return;
        if (data.baseType === "FOLLOW" && data.chat) dispatch(addNewChat({ chat: data.chat }));
        if (data.baseType === "UNFOLLOW" && data.deactivate_chat?.chat_id) dispatch(removeChat(data.deactivate_chat.chat_id));
      },
    });
  })();

  return () => {
    isMounted = false;
    
    // detach listeners if needed
  };
}, [userdata?.token]);
};
