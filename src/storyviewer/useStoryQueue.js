import { useState, useCallback, useEffect, useRef } from "react";

export function useStoryQueue({ stories = [], onComplete }) {
  const [index, setIndex] = useState(0);
  const completedRef = useRef(false);

  /* --------------------------------
     Reset when stories change
  --------------------------------- */
  useEffect(() => {
    setIndex(0);
    completedRef.current = false;
  }, [stories]);

  /* --------------------------------
     Next story
  --------------------------------- */
  const next = useCallback(() => {
    setIndex((prev) => {
      const nextIndex = prev + 1;

      // reached end
      if (nextIndex >= stories.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return prev;
      }

      return nextIndex;
    });
  }, [stories.length, onComplete]);

  /* --------------------------------
     Previous story
  --------------------------------- */
  const prev = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  /* --------------------------------
     Jump to specific index
  --------------------------------- */
  const jumpTo = useCallback(
    (i) => {
      if (!stories.length) return;
      completedRef.current = false;
      setIndex(Math.max(0, Math.min(i, stories.length - 1)));
    },
    [stories.length]
  );

  /* --------------------------------
     Manual reset
  --------------------------------- */
  const reset = useCallback(() => {
    completedRef.current = false;
    setIndex(0);
  }, []);

  /* --------------------------------
     Derived state
  --------------------------------- */
  const hasPrev = index > 0;
  const hasNext = index < stories.length - 1;

  return {
    activeStory: stories[index] || null,
    activeIndex: index,

    hasNext,
    hasPrev,

    next,
    prev,
    jumpTo,
    reset,
  };
}
