import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stories: [],
  loading: false,
  error: null,
};

const ensureSelfUser = (state, userData) => {
  if (!userData) return;

  if (!state.stories[0] || state.stories[0].user_id !== userData.user_id) {
    state.stories.unshift({
      user_id: userData.user_id,
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
       OPTIMISTIC ADD (SELF ONLY)
       requires userData injected
    -------------------------- */
    addStoryOptimistic: (state, action) => {
      const { story, userData } = action.payload;
     
      ensureSelfUser(state, userData);

      state.stories[0].stories.unshift(story);
    },

   updateStoryStatuses: (state, action) => {
  const updates = action.payload;

  if (!Array.isArray(updates)) return;

  // 🔑 self user always index 0
  const selfUser = state.stories[0];
  if (!selfUser || !Array.isArray(selfUser.stories)) return;

  updates.forEach(update => {
    const { local_id } = update;
    if (!local_id) return;

    const story = selfUser.stories.find(
      s => s.local_id === local_id
    );

    if (!story) return;

    // 🔁 PATCH ONLY provided fields
    Object.keys(update).forEach(key => {
      if (update[key] !== undefined) {
        story[key] = update[key];
      }
    });
  });
},
  },
});

export const {
 
  addStoryOptimistic,
 updateStoryStatuses
} = storySlice.actions;

export default storySlice.reducer;



const handleUpload = async () => {
    try {
      const storyId = uuidv4(); // unique ID
      if(!storyId){return ;}
      const filePath = imageUri;
      const type = "image";
      const caption = "";

      const newStory = {
        storyId,
        media_url: filePath,
        type,
        caption,
        created_at: Date.now(),
        music: {
          id: selectedTrack?.id || "",
          title: selectedTrack?.title || "",
          artist: selectedTrack?.artist || "",
          cover: selectedTrack?.cover?.replace("100x100", "300x300") || "",
          streamUrl: musicUrl || "",
        },
        isSending: true,
        isFailed: false,
        location: selectedLocation,
      };

      const userId = userdata.id;

      const musicUrlJson = JSON.stringify(newStory.music);

      // optimistic UI
      dispatch(
        addStoryOptimistic({
          user_id: userId,
          username: userdata.username, // ensure this exists
          email: userdata.email,
          aura: userdata.aura || 0,
          story: newStory,
        })
      );

console.log(storyId)
      
      // add to queue (local DB/file/whatever)
      await addToUploadQueue({ ...newStory, status: "pending" });
   const result = await WorkManagerModule.scheduleStoryUpload(
  storyId,
  filePath,
  type,
  caption,
  userId,
  musicUrlJson,
  selectedLocation,
  accessToken
);
      // schedule simulated upload result (async IIFE inside setTimeout with try/catch)
      // NOTE: setTimeout returns an id, store it if you want to cancel later.
  
      // navigate after scheduling the job
      navigation.navigate("MainTabs");
    } catch (error) {
      console.error("Story upload failed:", error);
      // optional: show toast/snackbar
    }
  };