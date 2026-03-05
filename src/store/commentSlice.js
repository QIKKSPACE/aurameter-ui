import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api"; // adjust path if needed

/* ---------------------------------
   Thunk: Fetch comments
----------------------------------*/
export const fetchCommentsByStoryId = createAsyncThunk(
  "comments/fetchByStoryId",
  async (storyId, { rejectWithValue }) => {
    try {
      console.log(storyId)
      const res = await api.get(
        `/storycomment/stories/${storyId}/comments`
      );
      return {
        storyId,
        comments: res.data.comments
      };
    } catch (err) {
      return rejectWithValue({ storyId });
    }
  }
);

/* ---------------------------------
   Initial State
----------------------------------*/
const initialState = {
  byStoryId: {}
};

/* ---------------------------------
   Slice
----------------------------------*/
const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    /* ---------------------------------
       Ensure story bucket
    ----------------------------------*/
    ensureStory(state, action) {
      const { storyId } = action.payload;

      if (!state.byStoryId[storyId]) {
        state.byStoryId[storyId] = {
          comments: [],
          isLoading: false,
          isError: false
        };
      }
    },

    /* ---------------------------------
       Optimistic add
    ----------------------------------*/
    addCommentOptimistic(state, action) {
      const { storyId, comment } = action.payload;

      if (!state.byStoryId[storyId]) {
        state.byStoryId[storyId] = {
          comments: [],
          isLoading: false,
          isError: false
        };
      }

      state.byStoryId[storyId].comments.unshift({
        ...comment,
        isSending: true,
        isFailed: false
      });
    },

    /* ---------------------------------
       Optimistic success
    ----------------------------------*/
    updateCommentSuccess(state, action) {
      const { storyId, tempId, serverComment } = action.payload;

      const story = state.byStoryId[storyId];
      if (!story) return;

      const index = story.comments.findIndex(
        c => c.id === tempId
      );

      if (index !== -1) {
        story.comments[index] = {
          ...serverComment,
          isSending: false,
          isFailed: false
        };
      }
    },

    /* ---------------------------------
       Optimistic failed
    ----------------------------------*/
    updateCommentFailed(state, action) {
      const { storyId, tempId } = action.payload;

      const story = state.byStoryId[storyId];
      if (!story) return;

      const comment = story.comments.find(
        c => c.id === tempId
      );

      if (comment) {
        comment.isSending = false;
        comment.isFailed = true;
      }
    }
  },

  /* ---------------------------------
     Extra reducers (Thunk)
  ----------------------------------*/
  extraReducers: builder => {
    builder

      /* -------- fetch pending -------- */
      .addCase(fetchCommentsByStoryId.pending, (state, action) => {
        const storyId = action.meta.arg;

        if (!state.byStoryId[storyId]) {
          state.byStoryId[storyId] = {
            comments: [],
            isLoading: true,
            isError: false
          };
        } else {
          state.byStoryId[storyId].isLoading = true;
          state.byStoryId[storyId].isError = false;
        }
      })

      /* -------- fetch success -------- */
      .addCase(fetchCommentsByStoryId.fulfilled, (state, action) => {
        const { storyId, comments } = action.payload;

        if (!state.byStoryId[storyId]) {
          state.byStoryId[storyId] = {
            comments: [],
            isLoading: false,
            isError: false
          };
        }

        state.byStoryId[storyId].comments = comments;
        state.byStoryId[storyId].isLoading = false;
        state.byStoryId[storyId].isError = false;
      })

      /* -------- fetch failed -------- */
      .addCase(fetchCommentsByStoryId.rejected, (state, action) => {
        const storyId = action.payload?.storyId || action.meta.arg;

        if (!state.byStoryId[storyId]) return;

        state.byStoryId[storyId].isLoading = false;
        state.byStoryId[storyId].isError = true;
      });
  }
});

/* ---------------------------------
   Exports
----------------------------------*/
export const {
  ensureStory,
  addCommentOptimistic,
  updateCommentSuccess,
  updateCommentFailed
} = commentSlice.actions;

export default commentSlice.reducer;
