import { readUploadQueue, writeUploadQueue } from "./UploadQueue";

/**
 * Reconcile local upload queue with server feed.
 *
 * Rules:
 * - Server is authoritative when available
 * - Pending uploads must ALWAYS be visible
 * - local_id is the source of truth for reconciliation
 * - Self user group must exist (with avatar / username)
 */
export const syncQueueWithFeed = async (
  feed,
  selfUser,
) => {
  const queue = await readUploadQueue();
  const selfUserId = selfUser?.id;
 
  /* -------------------------
     NO SERVER FEED (offline / failed fetch)
  -------------------------- */
  if (!Array.isArray(feed) || feed.length === 0) {
    if (!queue.length) return [];

    return [
      {
        user_id: selfUserId,
        username: selfUser?.username,
        avatar: selfUser?.avatar,
        stories: [...queue],
      },
    ];
  }

  /* -------------------------
     FIND / ENSURE SELF GROUP
  -------------------------- */
  let selfGroupIndex = feed.findIndex(
    f => String(f.user_id) === String(selfUserId)
  );

  let newFeed = [...feed];

  if (selfGroupIndex === -1) {
    newFeed.unshift({
      user_id: selfUserId,
      username: selfUser?.username,
      avatar: selfUser?.avatar,
      stories: [],
    });
    selfGroupIndex = 0;
  }

  const selfGroup = newFeed[selfGroupIndex];

  /* -------------------------
     BUILD SERVER LOCAL_ID SET
  -------------------------- */
  const serverLocalIds = new Set(
    (selfGroup.stories || [])
      .map(s => s.local_id)
      .filter(Boolean)
  );

  /* -------------------------
     RECONCILE QUEUE
  -------------------------- */
  const updatedQueue = [];
  const optimisticStories = [];

  queue.forEach(q => {
    const alreadyOnServer =
      q.local_id && serverLocalIds.has(q.local_id);

    if (!alreadyOnServer) {
      updatedQueue.push(q);
      optimisticStories.push(q);
    }
  });
const mergedStories = [...selfGroup.stories, ...optimisticStories].sort(
  (a, b) => {
    const t1 = new Date(a.created_at || a.added_at || 0).getTime();
    const t2 = new Date(b.created_at || b.added_at || 0).getTime();
    return t1 - t2; // newest first
  }
);
  /* -------------------------
     MERGE STORIES
  -------------------------- */
  newFeed[selfGroupIndex] = {
    ...selfGroup,
    username: selfGroup.username ?? selfUser?.username,
    avatar: selfGroup.avatar ?? selfUser?.avatar,
    stories: mergedStories,
  };

  /* -------------------------
     PERSIST CLEAN QUEUE
  -------------------------- */
 // await writeUploadQueue(updatedQueue);

  return newFeed;
};
