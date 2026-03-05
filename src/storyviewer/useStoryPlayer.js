import { useCallback, useEffect } from "react";
import {
  useSharedValue,
  withTiming,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

export function useStoryPlayer({
  durationMs,
  canPlay,
  onEnd,
}) {
  /**
   * Progress: 0 → 1
   */
  const progress = useSharedValue(0);

  /**
   * Prevent multiple onEnd calls
   */
  const ended = useSharedValue(false);

  /**
   * Duration stored on UI thread
   */
  const duration = useSharedValue(durationMs);

  /* -------------------------------
     Sync duration
  -------------------------------- */
  useEffect(() => {
    duration.value = durationMs;
  }, [durationMs]);

  /* -------------------------------
     React to play / pause
  -------------------------------- */
  useAnimatedReaction(
    () => canPlay,
    (playing) => {
      if (!playing) {
        cancelAnimation(progress);
        return;
      }

      if (ended.value) return;

      const remaining =
        (1 - progress.value) * duration.value;

      if (remaining <= 0) {
        ended.value = true;
        onEnd && runOnJS(onEnd)();
        return;
      }

      progress.value = withTiming(
        1,
        { duration: remaining },
        (finished) => {
          if (finished && !ended.value) {
            ended.value = true;
            onEnd && runOnJS(onEnd)();
          }
        }
      );
    }
  );

  /* -------------------------------
     Public API
  -------------------------------- */
const reset = useCallback(() => {
  cancelAnimation(progress);
  progress.value = 0;
  ended.value = false;
}, []);
  return {
    progress,
    reset,
  };
}
