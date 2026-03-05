// src/StoryViewer.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Text,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import Video from "react-native-video";
import { removeFromUploadQueue } from "./utils/UploadQueue"; // preserve original util
import { deleteStory } from "./store/storySlice";

import useStoryProgress from "./hooks/useStoryProgress";
import useStoryNavigation from "./hooks/useStoryNavigation";
import useStoryLifecycle from "./hooks/useStoryLifecycle";
import { sendStoryView } from "./utils/story/sendStoryView";
import { SERVER_URL, STORY_DURATION } from "./utils/story/constants";

import ProgressBars from "./components/ProgressBars";
import TopBar from "./components/TopBar";
import BottomActions from "./components/BottomActions";
import MusicPlayer from "./components/MusicPlayer";
import UploadOverlay from "./components/UploadOverlay";
import StoryImage from "./components/StoryImage";

const { width: SCR_W, height: SCR_H } = Dimensions.get("window");

const StoryViewer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { startUserIndex = 0 } = route.params || {};

  const storiesData = useSelector((s) => s.story.stories || []);
  const userdata = useSelector((s) => s.user.userData || {});

  const [userIndex, setUserIndex] = useState(startUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);

  const currentUserGroup = storiesData[userIndex];
  const currentUserStories = currentUserGroup?.stories || [];
  const currentStory = currentUserStories[storyIndex];

  // media / playback state that main still manages (music duration)
  const [musicDurationMs, setMusicDurationMs] = useState(null);

  // ref to ensure we send view only once per story
  const hasSentViewRef = useRef(false);

  // navigation helpers (tap zones + pan)
  const { handleNextStory, handlePrevStory, handleTap, panResponder } = useStoryNavigation({
    userIndex,
    storyIndex,
    storiesData,
    setUserIndex,
    setStoryIndex,
    navigation,
  });

  // progress & animation hook
  const hasMusic = !!(currentStory?.music && (currentStory.music.id || currentStory.music.streamUrl));
  const {
    progress,
    isPlaying,
    isBuffering,
    setIsPlaying,
    setImageReady,
    setMusicReady,
    setIsBuffering,
    getStoryDuration,
  } = useStoryProgress(currentStory, handleNextStory, hasMusic, musicDurationMs);

  // lifecycle (appstate / focus)
  useStoryLifecycle({ setIsPlaying });

  // image url resolution (local vs server)
  const imageUrl = useMemo(() => {
    if (!currentStory?.media_url) return null;
    const url = currentStory.media_url;
    if (typeof url !== "string") return null;
    if (url.startsWith("file://") || url.startsWith("content://")) return url;
    return `${SERVER_URL}${url}`;
  }, [currentStory]);

  // Reset music duration on story change
  useEffect(() => {
    setMusicDurationMs(null);
  }, [storyIndex, userIndex]);

  // send story view after ~3s of being ready (only once)
  useEffect(() => {
    if (!currentStory?.story_id) return;
    // only when ready to start we schedule a send
    const readyToStart = !hasMusic ? true : progress && !isBuffering; // progress presence used as proxy
    if (!readyToStart || hasSentViewRef.current) return;

    const timer = setTimeout(() => {
      sendStoryView({
        currentStory,
        currentUserGroup,
        userdata,
        dispatch,
      });
      hasSentViewRef.current = true;
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStory, isBuffering, hasMusic, progress]);

  // reset sent flag whenever we move to a new story or user
  useEffect(() => {
    hasSentViewRef.current = false;
  }, [storyIndex, userIndex]);

  // Loading state if no story
  if (!currentStory) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading stories...</Text>
      </View>
    );
  }

  // Show delete only when story belongs to current user
  const storyOwnerId = currentStory.user_id ?? currentStory.userId ?? currentStory.userIdLower ?? null;
  const showDelete = !!(storyOwnerId && userdata?.id && String(storyOwnerId) === String(userdata.id));

  // progress interpolation for progress bar component
  // ProgressBars component handles interpolation internally with the Animated.Value

  // isSending / failed flags from the story object
  const isSending = !!currentStory.isSending;
  const isFailed = !!currentStory.isFailed;

  // music title fallback
  const musicTitle =
    currentStory?.music?.title && currentStory?.music?.artist
      ? `${currentStory.music.title} — ${currentStory.music.artist}`
      : "Audio";

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ProgressBars progress={progress} currentIndex={storyIndex} total={currentUserStories.length} />

      <TopBar
        onClose={() => navigation.goBack()}
        onDelete={() => {
          const storyId = currentStory.story_id || currentStory.storyId;
          if (!storyId) return;
          dispatch(deleteStory({ storyId }));
          removeFromUploadQueue(storyId);
          // move to next story right away to avoid stuck UI
          handleNextStory();
        }}
        showDelete={showDelete}
      />

      <TouchableWithoutFeedback onPress={handleTap}>
        <StoryImage
          imageUrl={imageUrl}
          onLoadEnd={() => setImageReady(true)}
          onError={() => setImageReady(true)}
        />
      </TouchableWithoutFeedback>

      <UploadOverlay story={currentStory} />

      {!isSending && !isFailed && <BottomActions />}

      {hasMusic && currentStory.music?.streamUrl ? (
        <Video
          ref={(r) => {
            /* keep ref if needed; we don't need to expose it elsewhere currently */ 
          }}
          source={{ uri: currentStory.music.streamUrl }}
          audioOnly
          paused={!isPlaying || isBuffering}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoad={(meta) => {
            setMusicReady(true);
            if (meta?.duration) {
              const ms = Math.max(0, meta.duration * 1000);
              setMusicDurationMs(ms);
            }
          }}
          onBuffer={({ isBuffering: buf }) => setIsBuffering(!!buf)}
          onEnd={() => handleNextStory()}
          onError={() => {
            setMusicReady(true);
            setIsBuffering(false);
          }}
          style={{ width: 0, height: 0 }}
        />
      ) : null}

      {hasMusic ? (
        <MusicPlayer
          title={currentStory?.music?.title ?? "Audio"}
          artist={currentStory?.music?.artist ?? ""}
          isBuffering={isBuffering}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: SCR_W, height: SCR_H },
});

export default StoryViewer;
