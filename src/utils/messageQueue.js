// utils/messageQueue.js
import RNFS from 'react-native-fs';

const UPLOAD_FILE_PATH = RNFS.DocumentDirectoryPath + '/chat_message_queue.json';
const TEMP_FILE_PATH = UPLOAD_FILE_PATH + '.tmp';

export const MESSAGE_STATUS = {
  PENDING: 'pending',
  FAILED: 'failed',
  SENT: 'sent',
};

// single write lock
let writeLock = Promise.resolve();
const withLock = (fn) => {
  writeLock = writeLock.then(fn).catch((err) => console.error('❌ Queue lock error:', err));
  return writeLock;
};

// Read queue directly
export const readMessageQueue = async () => {
  try {
    const exists = await RNFS.exists(UPLOAD_FILE_PATH);
    if (!exists) return [];
    const content = await RNFS.readFile(UPLOAD_FILE_PATH, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('❌ Failed to read chat message queue:', err);
    return [];
  }
};

// Direct write to file (no lock, called inside lock)
const writeQueueToFile = async (queue) => {
  try {
    await RNFS.writeFile(TEMP_FILE_PATH, JSON.stringify(queue), 'utf8');
    await RNFS.moveFile(TEMP_FILE_PATH, UPLOAD_FILE_PATH);
  } catch (err) {
    console.error('❌ Failed to write chat message queue:', err);
  }
};

// Add message
export const addToMessageQueue = async (message) => {
  return withLock(async () => {
    const queue = await readMessageQueue();
    if (queue.some(q => q.message.local_id === message.local_id)) return;
    queue.push({
      chatId: message.chat_id,
      message: { ...message, status: MESSAGE_STATUS.PENDING, created_at: Date.now() },
    });
    await writeQueueToFile(queue);
    console.log('➕ Message added to queue:', message.local_id);
  });
};

// Remove message
export const removeFromMessageQueue = async (localId) => {
  return withLock(async () => {
    let queue = await readMessageQueue();
    const newQueue = queue.filter(q => q.message.local_id !== localId);
    await writeQueueToFile(newQueue);
    console.log('🗑️ Message removed from queue:', localId);
  });
};

// Mark failed
export const markMessageFailed = async (localId) => {
  return withLock(async () => {
    let queue = await readMessageQueue();
    queue = queue.map(q =>
      q.message.local_id === localId ? { ...q, message: { ...q.message, status: MESSAGE_STATUS.FAILED } } : q
    );
    await writeQueueToFile(queue);
    console.log('⚠️ Message marked as failed:', localId);
  });
};

// Mark sent (remove from queue)
export const markMessageSent = async (localId) => {
  return withLock(async () => {
    let queue = await readMessageQueue();
    queue = queue.filter(q => q.message.local_id !== localId);
    await writeQueueToFile(queue);
    console.log('✅ Message sent and removed from queue:', localId);
  });
};

// Get messages by chat
export const getMessagesByChatId = async (chatId) => {
  try {
    const queue = await readMessageQueue();
    return queue
      .filter(q => q.chatId === chatId)
      .sort((a, b) => a.message.created_at - b.message.created_at)
      .map(q => q.message);
  } catch (err) {
    console.error('❌ Failed to get messages by chatId:', chatId, err);
    return [];
  }
};
// Retry a message in the queue
export const retryMessageInQueue = async (localId) => {
  return withLock(async () => {
    let queue = await readMessageQueue();

    queue = queue.map(q => {
      if (q.message.local_id === localId) {
        return {
          ...q,
          message: {
            ...q.message,
            status: MESSAGE_STATUS.PENDING,
            created_at: Date.now() // reset timestamp to now
          }
        };
      }
      return q;
    });

    await writeQueueToFile(queue);
    console.log('🔄 Message retried (status -> pending, timestamp updated):', localId);
  });
};


export const markMessagePending = async (localId) => {
  return withLock(async () => {
    let queue = await readMessageQueue();
    queue = queue.map(q =>
      q.message.local_id === localId
        ? { ...q, message: { ...q.message, status: MESSAGE_STATUS.PENDING } }
        : q
    );
    await writeQueueToFile(queue);
    console.log('🔄 Message marked as pending:', localId);
  });
};
