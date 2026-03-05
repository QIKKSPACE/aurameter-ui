import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stories: [],
  loading: false,
  error: null,
};

const ensureSelfUser = (state, userData) => {
  if (!userData) return;

  const selfUserId = userData.user_id ?? userData.id;

  if (!state.stories[0] || state.stories[0].user_id !== selfUserId) {
    state.stories.unshift({
      user_id: selfUserId,
      username: userData.username,
      email: userData.email,
      aura: userData.aura,
      avatar: userData.avatar,
      stories: [],
    });
  }
};

const storySlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    /* -------------------------
       FETCH
    -------------------------- */
    fetchStoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchStoriesSuccess: (state, action) => {
      state.loading = false;
      state.stories = action.payload;
      state.error = null;
    },

    fetchStoriesFailure: (state, action) => {
      state.loading = false;
      state.stories = action.payload.feed;
      state.error = action.payload.error || "Failed to fetch stories";
    },

    /* -------------------------
       OPTIMISTIC ADD (SELF ONLY)
    -------------------------- */
    addStoryOptimistic: (state, action) => {
      const { story, userData } = action.payload;
      ensureSelfUser(state, userData);
      state.stories[0].stories.push(story);
    },

    /* -------------------------
       BULK STATUS UPDATE (SELF)
    -------------------------- */
    updateStoryStatuses: (state, action) => {
      const updates = action.payload;
      if (!Array.isArray(updates)) return;

      const selfUser = state.stories[0];
      if (!selfUser || !Array.isArray(selfUser.stories)) return;

      updates.forEach(update => {
        const { local_id } = update;
        if (!local_id) return;

        const story = selfUser.stories.find(
          s => String(s.local_id) === String(local_id)
        );

        if (!story) return;

        Object.keys(update).forEach(key => {
          if (update[key] !== undefined) {
            story[key] = update[key];
          }
        });
      });
    },

    /* -------------------------
       POLLING (SINGLE PATCH)
    -------------------------- */
    updateStoryFromPolling: (state, action) => {
      const { user_id, local_id, patch } = action.payload;

      const user = state.stories.find(u => u.user_id === user_id);
      if (!user) return;

      const story = user.stories.find(
        s => String(s.local_id) === String(local_id)
      );
      if (!story) return;

      Object.assign(story, patch);
    },

    deleteStory: (state, action) => {
      const { local_id } = action.payload;
      if (!state.stories[0]) return;

      state.stories[0].stories = state.stories[0].stories.filter(   
        s => String(s.local_id) !== String(local_id)
      );
    },
  markSingleStoryAsSeen: (state, action) => {
  const { user_id, local_id } = action.payload;

  // 1️⃣ Find the user
  const user = state.stories.find(u => u.user_id === user_id);
  if (!user || !Array.isArray(user.stories)) return;

  // 2️⃣ Find the story
  const story = user.stories.find(s => String(s.local_id) === String(local_id));
  if (!story || story.seen) return; // already seen, no need to process

  // 3️⃣ Mark the story as seen
  story.seen = true;

  // 4️⃣ Streak logic
  const now = new Date();
  const lastUpdated = user.last_streak_updated
    ? new Date(user.last_streak_updated)
    : null;

  // Only increment if:
  // - User has viewed at least one story
  // - Last streak update was more than 24 hours ago
  const moreThan24h = !lastUpdated || (now - lastUpdated > 24 * 60 * 60 * 1000);

  if (user.has_viewed_recent_story && moreThan24h) {
    user.current_streak_count = (user.current_streak_count || 0) + 1;
    user.last_streak_updated = now.toISOString(); // update timestamp
  }
},

 updateUserGroup: (state, action) => {
      const { user_id, patch } = action.payload;
      if (!user_id || !patch) return;

      const user = state.stories.find(u => u.user_id === user_id);
      if (!user) return;

      Object.keys(patch).forEach(key => {
        if (patch[key] !== undefined) {
          user[key] = patch[key];
        }
      });
    },
  },
});

export const {
  fetchStoriesStart,
  fetchStoriesSuccess,
  fetchStoriesFailure,
  addStoryOptimistic,
  updateStoryStatuses,
  updateStoryFromPolling,
  deleteStory,
  markSingleStoryAsSeen,
  updateUserGroup
} = storySlice.actions;

export default storySlice.reducer;
