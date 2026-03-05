import { createSelector } from '@reduxjs/toolkit';
import { hasPollableStories } from '../polling/storyPollingRules';


// Memoized selector for your stories array
export const selectSelfStories = createSelector(
  (state) => state.story?.stories?.[0]?.stories,
  (stories) => stories || []
);

// Memoized selector for derived "pollable" state
export const selectHasPollableStories = createSelector(
  selectSelfStories,
  (selfStories) => hasPollableStories(selfStories)
);

export const selectRehydrated = (state) => state._persist?.rehydrated;
