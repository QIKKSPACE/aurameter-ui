import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import {
  getMessagesByChatId,
  removeFromMessageQueue
} from '../utils/messageQueue';

/**
 * ==========================
 * FETCH MESSAGES (PAGINATION)
 * seq-based (before_seq)
 * ==========================
 */
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ chatId, cursor }, { rejectWithValue }) => {
    try {
      // 🔑 cursor = before_seq
      const params = cursor
        ? { before_seq: cursor }
        : {};

      const res = await api.get(
        `/chats/${chatId}/messages`,
        { params }
      );

      const serverMessages = res.data.messages || [];
      const queuedMessages = await getMessagesByChatId(chatId);

      /**
       * 🔥 Remove queued messages that server has confirmed
       * Match by local_id
       */
      const serverLocalIds = new Set(
        serverMessages.map(m => m.local_id).filter(Boolean)
      );

      for (const q of queuedMessages) {
        if (q.local_id && serverLocalIds.has(q.local_id)) {
          await removeFromMessageQueue(q.local_id);
        }
      }

      /**
       * 🔁 Merge server + remaining queued
       * Server is authoritative
       */
      const merged = [...serverMessages];

      const localIdSet = new Set(
        merged.map(m => m.local_id).filter(Boolean)
      );

      queuedMessages.forEach(q => {
        if (q.local_id && !localIdSet.has(q.local_id)) {
          merged.push(q);
        }
      });

      return {
        chatId,
        messages: merged,
        cursor: res.data.nextCursor
          ? res.data.nextCursor.before_seq
          : null,
        hasMore: res.data.hasMore
      };

    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: 'Fetch failed' }
      );
    }
  }
);


/**
 * ==========================
 * SYNC NEW MESSAGES
 * seq-based (after_seq)
 * ==========================
 */
export const syncMessages = createAsyncThunk(
  'messages/syncMessages',
  async (
    { chatId, afterSeq, limit = 50 },
    { rejectWithValue }
  ) => {
    try {
      if (afterSeq === undefined || afterSeq === null) {
        throw new Error('afterSeq is required');
      }

      const res = await api.get(
        `/chats/${chatId}/messages/sync`,
        {
          params: {
            after_seq: afterSeq,
            limit
          }
        }
      );

      return {
        chatId,
        messages: res.data.messages || [],
        serverTime: res.data.serverTime
      };

    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: 'Sync failed' }
      );
    }
  }
);

export const syncGapMessages = createAsyncThunk(
  'messages/syncGapMessages',
  async (
    { chatId, seqStart, seqEnd },
    { rejectWithValue }
  ) => {
    try {
      // 1️⃣ Validation (client-side safety)
      console.log(chatId,seqStart,seqEnd)
      if (
        seqStart === undefined ||
        seqEnd === undefined ||
        seqStart === null ||
        seqEnd === null
      ) {
        throw new Error('seqStart and seqEnd are required');
      }

      if (seqStart > seqEnd) {
        throw new Error('Invalid seq range');
      }

      // 2️⃣ API call to GAP endpoint
      const res = await api.get(
        `/chats/${chatId}/messages/gap`,
        {
          params: {
            seq_start: seqStart,
            seq_end: seqEnd
          }
        }
      );

      // 3️⃣ Return normalized payload
      return {
        chatId,
        messages: res.data.messages || []
      };

    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: 'Gap sync failed' }
      );
    }
  }
);
