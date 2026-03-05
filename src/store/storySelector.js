import { createSelector } from "@reduxjs/toolkit";

export const makeSelectCommentsByStoryId = (storyId) =>
  createSelector(
    (state) => state.comment.byStoryId[storyId]?.comments,
    (comments = []) => comments
  );