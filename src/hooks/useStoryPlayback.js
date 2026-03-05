import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const STORY_DURATION = 15000;

export function useStoryPlayback({
  storiesData,
  startUserIndex = 0,
  onFinishAll,
}) {
  /* ------------------ INDEX STATE ------------------ */
  const [userIndex, setUserIndex] = useState(startUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);

  const currentUserStories = storiesData[userIndex]?.stories || [];
  const currentStory = currentUserStories[storyIndex];

  /* ------------------ PLAYBACK STATE ------------------ */
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [musicDurationMs, setMusicDurationMs] = useState(null);

  const hasMusic = !!currentStory?.music?.streamUrl;

  /* ------------------ REANIMATED ------------------ */
  const progress = useSharedValue(0);
  const animationIdRef = useRef(0);

  /* ------------------ TIMING ------------------ */
  const storyDuration = useMemo(() => {
    if (musicDurationMs && hasMusic) {
      return Math.min(STORY_DURATION, musicDurationMs);
    }
    return STORY_DURATION;
  }, [musicDurationMs, hasMusic]);

  const readyToStart = useMemo(() => {
    return hasMusic
      ? imageReady && musicReady && !isBuffering
      : imageReady;
  }, [imageReady, musicReady, isBuffering, hasMusic]);

  /* ------------------ PROGRESS CONTROL ------------------ */
  const startProgress = useCallback(() => {
    animationIdRef.current += 1;
    const id = animationIdRef.current;

    cancelAnimation(progress);
    progress.value = 0;

    progress.value = withTiming(
      1,
      { duration: storyDuration },
      (finished) => {
        if (finished && id === animationIdRef.current) {
          runOnJS(goNextStory)();
        }
      }
    );
  }, [storyDuration]);

  const pauseProgress = useCallback(() => {
    cancelAnimation(progress);
  }, []);

  const completeAndResetProgress = useCallback(() => {
    animationIdRef.current += 1;
    cancelAnimation(progress);

    // Instantly complete current bar
    progress.value = 1;

    // Next frame → reset for next story
    requestAnimationFrame(() => {
      progress.value = 0;
    });
  }, []);

  /* ------------------ NAVIGATION ------------------ */
  const goNextUser = useCallback(() => {
    let next = userIndex + 1;

    while (
      next < storiesData.length &&
      !storiesData[next]?.stories?.length
    ) {
      next++;
    }

    if (next < storiesData.length) {
      setUserIndex(next);
      setStoryIndex(0);
    } else {
      onFinishAll?.();
    }
  }, [userIndex, storiesData, onFinishAll]);

  const goPrevUser = useCallback(() => {
    let prev = userIndex - 1;

    while (prev >= 0 && !storiesData[prev]?.stories?.length) {
      prev--;
    }

    if (prev >= 0) {
      setUserIndex(prev);
      setStoryIndex(0);
    } else {
      onFinishAll?.();
    }
  }, [userIndex, storiesData, onFinishAll]);

  const goNextStory = useCallback(() => {
    completeAndResetProgress();

    if (storyIndex < currentUserStories.length - 1) {
      setStoryIndex((s) => s + 1);
    } else {
      goNextUser();
    }
  }, [storyIndex, currentUserStories.length, goNextUser]);

  const goPrevStory = useCallback(() => {
    completeAndResetProgress();

    if (storyIndex > 0) {
      setStoryIndex((s) => s - 1);
    } else {
      goPrevUser();
    }
  }, [storyIndex, goPrevUser]);

  /* ------------------ LIFECYCLE ------------------ */
  useEffect(() => {
    animationIdRef.current += 1;
    cancelAnimation(progress);
    progress.value = 0;

    setImageReady(false);
    setMusicReady(false);
    setIsBuffering(false);
    setIsPlaying(true);
    setMusicDurationMs(null);
  }, [storyIndex, userIndex]);

  useEffect(() => {
    if (!currentStory) return;

    if (!isPlaying) {
      pauseProgress();
      return;
    }

    if (readyToStart) {
      startProgress();
    } else {
      pauseProgress();
    }
  }, [readyToStart, isPlaying, currentStory]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setIsPlaying(false);
      }
    });

    return () => sub.remove();
  }, []);

  /* ------------------ ANIMATED STYLE ------------------ */
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  /* ------------------ API ------------------ */
  return {
    userIndex,
    storyIndex,
    currentStory,
    currentUserStories,

    isPlaying,
    setIsPlaying,
    imageReady,
    setImageReady,
    musicReady,
    setMusicReady,
    isBuffering,
    setIsBuffering,
    setMusicDurationMs,

    goNextStory,
    goPrevStory,
    goNextUser,
    goPrevUser,

    progressStyle,
    readyToStart,
  };
}
