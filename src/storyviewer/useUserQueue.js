import { useState, useCallback, useEffect } from "react";

export function useUserQueue({
  users = [],
  startIndex = 0,
  onComplete,
}) {
  const [index, setIndex] = useState(startIndex);
  const [completed, setCompleted] = useState(false);

  /* -------------------------------
     Sync when users / startIndex change
  -------------------------------- */
  useEffect(() => {
    setIndex(startIndex);
    setCompleted(false);
  }, [users, startIndex]);

  /* -------------------------------
     Move forward
  -------------------------------- */
  const next = useCallback(() => {
    setIndex((prev) => {
      let nextIndex = prev + 1;

      while (
        nextIndex < users.length &&
        (!users[nextIndex]?.stories ||
          users[nextIndex].stories.length === 0)
      ) {
        nextIndex++;
      }

      if (nextIndex >= users.length) {
        if (!completed) {
          setCompleted(true);
          onComplete && onComplete();
        }
        return prev;
      }

      return nextIndex;
    });
  }, [users, onComplete, completed]);

  /* -------------------------------
     Move backward
  -------------------------------- */
  const prev = useCallback(() => {
    setIndex((prev) => {
      let prevIndex = prev - 1;

      while (
        prevIndex >= 0 &&
        (!users[prevIndex]?.stories ||
          users[prevIndex].stories.length === 0)
      ) {
        prevIndex--;
      }

      return prevIndex >= 0 ? prevIndex : prev;
    });
  }, [users]);

  return {
    activeUser: users[index] || null,
    activeIndex: index,
    next,
    prev,
  };
}
