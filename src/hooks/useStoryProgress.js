import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { STORY_DURATION } from "../utils/story/constants";

export default function useStoryProgress(currentStory, onNextStory, hasMusic, musicDurationMs) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [musicReady, setMusicReady] = useState(!hasMusic); // true by default if no music
  const [isBuffering, setIsBuffering] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);
  const lastProgress = useRef(0);

  const getStoryDuration = () =>
    hasMusic && musicDurationMs
      ? Math.min(STORY_DURATION, musicDurationMs)
      : STORY_DURATION;

  const stopAnimation = () => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  };

  const pauseAnimation = () => {
    stopAnimation();
    progress.stopAnimation((val) => (lastProgress.current = val));
  };

  const startAnimation = () => {
    stopAnimation();
    const remaining = (1 - lastProgress.current) * getStoryDuration();
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) onNextStory();
    });
  };

  const resetAnimation = () => {
    stopAnimation();
    lastProgress.current = 0;
    progress.setValue(0);
  };

  // Track progress continuously
  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      lastProgress.current = value;
    });
    return () => {
      progress.removeListener(id);
    };
  }, [progress]);

  // Reset when story changes
  useEffect(() => {
    resetAnimation();
    setImageReady(false);
    setMusicReady(!hasMusic);
    setIsBuffering(false);
  }, [currentStory, hasMusic]);

  const readyToStart = imageReady && musicReady && !isBuffering;

  useEffect(() => {
    console.log("⏳ States:", {
      imageReady,
      musicReady,
      isBuffering,
      readyToStart,
      isPlaying,
    });

    if (!isPlaying && progress.__getValue() > 0) {
      // Only pause if playback already started
      pauseAnimation();
      return;
    }

    if (isPlaying && readyToStart) {
      startAnimation();
    } else {
      pauseAnimation();
    }
  }, [isPlaying, readyToStart, currentStory]);

  return {
    progress,
    isPlaying,
    isBuffering,
    setIsPlaying,
    setImageReady,
    setMusicReady,
    setIsBuffering,
    getStoryDuration,
  };
}
