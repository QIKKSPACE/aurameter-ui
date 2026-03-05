// storyPollingRules.js

// Server-controlled, in-progress states
export const   POLLING_STATUSES = new Set([
  "PENDING",
  "AI_ACCEPTED",
  "AI_FAILED",
  "UPLOADING",
  "PERSISTING",
  
]);
   
// States that should never be polled
export const NON_POLLING_STATUSES = new Set([
  "FAILED",
  "AI_REJECTED",
  "ACCEPTED",

]);

export function shouldPollStatus(status) {
  return POLLING_STATUSES.has(status);
}

export function hasPollableStories(stories = []) {
  return stories.some(story => shouldPollStatus(story.status));
}
