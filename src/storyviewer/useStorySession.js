import { useEffect, useCallback, useRef } from "react";
import { useUserQueue } from "./useUserQueue";
import { useStoryQueue } from "./useStoryQueue";

export function useStorySession({
  users = [],
  startUserIndex = 0,
  startStoryIndex = null,
  onComplete,
}) {

  /* ---------------- USER QUEUE ---------------- */
  const {
    activeUser,
    activeIndex: userIndex,
    next: nextUser,
    prev: prevUser,
  } = useUserQueue({
    users,
    startIndex: startUserIndex,
    onComplete,
  });

  /* ---------------- STORY QUEUE ---------------- */
  const {
    activeStory,
    activeIndex: storyIndex,
    next: nextStory,
    prev: prevStory,
    jumpTo,
    reset: resetStoryQueue,
  } = useStoryQueue({
    stories: activeUser?.stories || [],
    onComplete: nextUser, // when stories end → next user
  });

const pendingJumpRef = useRef(startStoryIndex);
const didInitRef = useRef(false);

useEffect(() => {
  if (
    !didInitRef.current &&
    pendingJumpRef.current != null &&
    activeUser?.stories?.length
  ) {
    jumpTo(
      Math.min(
        pendingJumpRef.current,
        activeUser.stories.length - 1
      )
    );

    didInitRef.current = true;
    pendingJumpRef.current = null;
  }
}, [
  activeUser?.stories?.length, // 👈 THIS is the fix
  jumpTo
]);


  /* ---------------- DERIVED ---------------- */
  const storyCount = activeUser?.stories?.length || 0;

  /* ---------------- SMART NAVIGATION ---------------- */
const smartPrev = useCallback(() => {
  // normal previous story
  if (storyIndex > 0) {
    prevStory();
    return;
  }

  // previous user exists
  const prevUserIndex = userIndex - 1;
  if (prevUserIndex >= 0) {
    const prevUserStories = users[prevUserIndex]?.stories || [];
    if (!prevUserStories.length) return;

    pendingJumpRef.current = prevUserStories.length - 1;
    prevUser();
    return;
  }

  // 🚨 no previous user → SESSION START reached
  onComplete?.("START"); // expose reason
}, [
  storyIndex,
  userIndex,
  users,
  prevStory,
  prevUser,
  onComplete,
]);
  const smartNext = useCallback(() => {
    // go to next story
    if (storyIndex < storyCount - 1) {
      nextStory();
      return;
    }

    // otherwise let storyQueue trigger nextUser
    nextStory();
  }, [storyIndex, storyCount, nextStory]);

  /* ---------------- API ---------------- */
  return {
    // active
    activeUser,
    activeStory,

    // indexes
    userIndex,
    storyIndex,
    storyCount,

    // navigation
    nextStory: smartNext,
    prevStory: smartPrev,

    // user controls (optional exposure)
    nextUser,
    prevUser,
  };
}
