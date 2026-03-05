import { createSelector } from "@reduxjs/toolkit";

const EMPTY_COMMENT_STATE = {
  comments: [],
  isLoading: false,
  isError: false,
};

// base selector
const selectCommentsState = (state, storyId) =>
  state.comment.byStoryId[storyId] ?? EMPTY_COMMENT_STATE;

// selector factory (IMPORTANT)
export const makeSelectCommentsWithMeta = () =>
  createSelector([selectCommentsState], commentState => ({
    comments: commentState.comments,
    isLoading: commentState.isLoading,
    isError: commentState.isError,
  }));


  export const selectCommentsByStoryId = (state, storyId) => {
  const story = state.comment.byStoryId[storyId];

  return {
    comments: story?.comments ?? [],
    isLoading: story?.isLoading ?? false,
    isError: story?.isError ?? false,
  };
};