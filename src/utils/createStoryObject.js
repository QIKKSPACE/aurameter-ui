import { uuidv4 } from "./uuid";

/**
 * Creates a story object exactly matching the Postgres schema
 */
export function createStoryObject({
  localId,
  userId,
  type,
  mediaUrl,
  caption = null,
  location = null,
  taggedUsers = [],
  taggedUser,
  blurhash = null,
  music = null,
  layers
}) {
  const now = new Date().toISOString();
 

  return {
    story_id: null,                // server UUID (filled on ACCEPTED)
    local_id: localId ?? uuidv4(),       // immutable client UUID
    userId: userId,

    media_url: mediaUrl,     // main path updated when when ACCEPTED (published)
    server_url: null,        // to track file that will be uplaoded to s3 maybe neede after server restart

    type,
    caption,
    location,
   tagged_users: taggedUser ? [taggedUser] : [],

    status: "LOCAL_QUEUED",

    ai_rejected_response: null,
    geminiaura: 0,
    geminicomment: null,

    aura_count: 0,
    comment_count: 0,
    like_count: 0,

    retry_count: 0,
    last_retry_at: null,

    added_at: now,           // when server receives file
    created_at: null,        // when ACCEPTED (published)
   
    blurhash,
    music,
    layers
  };
}
