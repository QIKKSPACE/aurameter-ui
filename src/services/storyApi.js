// storyApi.js
import api from "./api";
 const POLLING_STATUSES = new Set([
  "PENDING",
  "AI_ACCEPTED",
  "AI_FAILED",
  "UPLOADING",
  "PERSISTING",
  
]);
export async function fetchSelfStoryStatuses(stories = []) {
  const updates = await Promise.all(
    stories.map(async (story) => {
      try {

           if (!POLLING_STATUSES.has(story.status)) {
        return story;
      }

        const res = await api.get(
          `/stories/poll/${story.local_id}/status`
        );

        const data = res.data;
        // ❗ Server explicitly says failed (timeout / never reached)
        if (data?.success === false && res.status === 408) {
          return {
            ...story,
            status: "FAILED",
          };
        }
       console.log(data)
        return {
          ...story, // preserve anything else
          story_id: data.id,
          status: data.status,
          geminiaura: data.geminiaura ?? null,
          geminicomment: data.geminicomment ?? null,
          ai_rejected_response: data.ai_rejected_response ?? null,

          // ✅ media source of truth
          media_url:
            data.status === "ACCEPTED"
              ? data.media_url ?? null
              : story.media_url ?? null,

          created_at: data.created_at ?? story.created_at ?? null,
        };
      } catch (err) {
        /**
         * Axios error handling
         * - If server responded with 408 → mark FAILED
         * - Otherwise keep story as-is (temporary network issue)
         */
        const status = err?.response?.status;
        const success = err?.response?.data?.success;

        if (status === 408 && success === false) {
          return {
            ...story,
            status: "FAILED",
          };
        }

        console.error(
          `Error fetching status for story ${story.local_id}:`,
          err
        );

        // keep old state on polling failure
        return story;
      }
    })
  );

  return updates;
}
