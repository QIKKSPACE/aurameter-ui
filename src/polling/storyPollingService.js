// storyPollingService.js
import { fetchSelfStoryStatuses } from "../services/storyApi";
import { store } from "../store/store";
import { updateStoryStatuses } from "../store/storySlice";
import { markUploadAccepted, updateUploadStatus } from "../utils/UploadQueue";
import { hasPollableStories } from "./storyPollingRules";
import { readUploadQueue } from "../utils/UploadQueue";

let intervalId = null;
let isPolling = false;

const POLL_INTERVAL = 7500; // 5 seconds
 const POLLING_STATUSES = new Set([
  "PENDING",
  "AI_ACCEPTED",
  "AI_FAILED",
  "UPLOADING",
  "PERSISTING",
  
]);
async function pollOnce() {
  if (!isPolling) return;

const queue = await readUploadQueue();

const pollableStories = queue.filter(q =>
  POLLING_STATUSES.has(q.status)
);



  // Nothing to poll → stop polling
  if (pollableStories.length === 0) {
    stopStoryPolling();
    return;
  }

  try {
    // ✅ Send ONLY pollable stories
    const updates = await fetchSelfStoryStatuses(pollableStories);

    // Reducer will merge by local_id
    store.dispatch(updateStoryStatuses(updates));
   await Promise.all(
  updates.map(async item => {
    if (item.status === "ACCEPTED") {
      await markUploadAccepted(item.local_id);
    } else {
      await updateUploadStatus(item);
    }
  })
);
    console.log("🟢 Polled updates:", updates);
  } catch (error) {
    console.error("Story polling failed:", error);
    // Safe to ignore → retry next tick
  }
}

export function startStoryPolling() {
  if (intervalId) return;

  isPolling = true;
  
  intervalId = setInterval(pollOnce, POLL_INTERVAL);
}

export function stopStoryPolling() {
  isPolling = false;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
