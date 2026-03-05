import { createAsyncThunk } from "@reduxjs/toolkit";
import {  readMessageQueue } from "../utils/messageQueue";
import { addOptimisticMessage } from "./messageSlice";

export const hydrateQueuedMessages = createAsyncThunk(
  "messages/hydrateQueuedMessages",
  async (_, { dispatch }) => {
    console.log("Dehydratingggg waitt")
    const queued = await readMessageQueue();
   
    for (const msg of queued) {
        
      dispatch(addOptimisticMessage({
        chatId: msg.message.chat_id,
        message:msg.message
      }));
    }
  }
);
