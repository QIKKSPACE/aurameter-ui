import {uuidv4} from './uuid'

/**
 * Creates a message object exactly matching the Postgres schema
 * @param {Object} params
 * @param {string} params.type - message type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'music' | 'system'
 * @param {string} params.chatId - chat ID
 * @param {string} params.senderId - sender ID
 * @param {Object} params.payload - type-specific payload
 *        text: { content }
 *        file/image/video/audio: { fileUrl, content? }
 *        music: { musicObject, content? }
 *        system: { content }
 * @returns {Object} message object
 */

const MESSAGE_STATUSES = ['pending', 'failed', 'sent'];

function randomStatus() {
  return MESSAGE_STATUSES[
    Math.floor(Math.random() * MESSAGE_STATUSES.length)
  ];
}
export function createMessageObject({
  type,
  chatId,
  senderId,
  payload,
  replyTo = null,// 👈 message object OR null,
  fileUrl=null
}) {
  const now = new Date().toISOString();
  const localId = uuidv4();

  let message = {
    id: null,
    chat_id: chatId,
    sender_id: senderId,
    message_type: type,
    content: null,
    file_url: null,
    created_at: now,
    waveform: null,
    duration: null,
    local_id: localId,
    music: null,
    seq:null,
    status: 'pending',

    // 👇 server field
    replying_to: replyTo ? replyTo.id : null,

    // 👇 UI-only (do NOT send to server)
    reply: replyTo
      ? {
          id: replyTo.id,
          local_id:replyTo?.local_id,
          sender_id: replyTo.sender_id,
          message_type: replyTo.message_type,
          content: replyTo.content ?? null,
          file_url: replyTo.file_url ?? null,
          music: replyTo.music ?? null,
          created_at: replyTo.created_at
        }
      : null
  };

  switch (type) {
    case 'text':
      message.content = payload.content ?? '';
      break;
    case 'image':
    case 'video':
    case 'file':
      message.file_url = payload.fileUrl ?? null;
      message.content = payload.content ?? null;
      break;
 case 'sticker': 
  message.file_url = payload.fileUrl ?? null;
      message.content = null;
      case 'quiz': 
  message.quiz = {id:payload?._id,quizName:payload?.quizName,description:payload?.description,userId:payload?.userId};
      message.content = null;
    case 'audio':
      message.file_url = payload.fileUrl ?? null;
      message.waveform = payload.waveform ?? null;
      message.duration = payload.duration ?? null;
      break;

    case 'music':
      message.music = payload ?? null;
      break;

    case 'system':
      message.content = payload.content ?? '';
      break;

    default:
      throw new Error(`Unsupported message type: ${type}`);
  }

  return message;
}
