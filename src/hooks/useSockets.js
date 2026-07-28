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
import { shouldIncrementUnreadForMessage } from "../utils/unread";

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
    if (shouldIncrementUnreadForMessage(state, chatId, message)) {
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
