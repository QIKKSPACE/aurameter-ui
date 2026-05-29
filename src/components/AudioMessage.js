import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import Video from "react-native-video";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import AudioPlaybackManager from "./AudioPlaybackManager";
import AppText from "./AppText";

const MAX_BARS = 32;

const MIN_BAR_HEIGHT = 10;
const MAX_BAR_HEIGHT = 26;

const WAVEFORM_WIDTH = 140;

const MediaMessage = ({
  message,
  isMe,
}) => {
  const playerRef = useRef(null);

  /**
   * CONTROLLER
   */
const controllerRef = useRef({
  stop: () => {
    setIsPlaying(false);

    setProgress(0);

    progressX.value = 0;

    try {
      playerRef.current?.seek(0);
    } catch (e) {}
  },
});
  /**
   * STATES
   */
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [durationSec, setDurationSec] =
    useState(0);

  const progressX = useSharedValue(0);

  /**
   * TYPES
   */
  const isAudio =
    message.message_type === "audio";

  const isMusic =
    message.message_type === "music";

  const messageId =
    message.message_id ||
    message.id;

  /**
   * RESET ON CELL REUSE
   */
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsLoaded(false);

    progressX.value = 0;
  }, [messageId]);

  /**
   * CLEANUP
   */
  useEffect(() => {
    return () => {
      AudioPlaybackManager.stop(
        controllerRef.current
      );
    };
  }, []);

  /**
   * WAVEFORM
   */
  const waveform = useMemo(() => {
    if (
      !isAudio ||
      !message.waveform
    ) {
      return [];
    }

    const bars =
      message.waveform.slice(
        0,
        MAX_BARS
      );

    return isMe
      ? [...bars].reverse()
      : bars;
  }, [message, isAudio, isMe]);

  /**
   * PLAY / PAUSE
   */
 const togglePlay = () => {
  /**
   * PAUSE CURRENT
   */
  if (isPlaying) {
    setIsPlaying(false);

    AudioPlaybackManager.stop(
      controllerRef.current
    );

    return;
  }

  /**
   * STOP PREVIOUS AUDIO
   */
  AudioPlaybackManager.play(
    controllerRef.current
  );

  /**
   * START PLAYING
   */
  setIsPlaying(true);
};
  /**
   * SEEK
   */
  const seekTo = (x) => {
  if (!playerRef.current) return;

  if (!durationSec) return;

  const clamped = Math.max(
    0,
    Math.min(
      x,
      WAVEFORM_WIDTH
    )
  );

  const nextProgress =
    clamped / WAVEFORM_WIDTH;

  const seekTime =
    nextProgress * durationSec;

  /**
   * STOP PREVIOUS AUDIO
   */
  AudioPlaybackManager.play(
    controllerRef.current
  );

  /**
   * UPDATE UI
   */
  setProgress(nextProgress);

  progressX.value = clamped;

  /**
   * SEEK
   */
  try {
    playerRef.current.seek(
      seekTime
    );

    /**
     * AUTO PLAY AFTER SEEK
     */
    setIsPlaying(true);

  } catch (err) {
    console.log(
      "Seek error",
      err
    );
  }
};

  /**
   * GESTURE
   * SEEK ONLY ON RELEASE
   */
  const pan = Gesture.Pan()
    .onEnd((e) => {
      runOnJS(seekTo)(e.x);
    });

  /**
   * PROGRESS
   */
  const onProgress = ({
    currentTime,
  }) => {
    if (!durationSec) return;

    const next =
      currentTime / durationSec;

    const value = Math.min(
      1,
      next
    );

    setProgress(value);

    progressX.value =
      value * WAVEFORM_WIDTH;
  };

  /**
   * END
   */
  const onEnd = () => {
    setIsPlaying(false);

    setProgress(0);

    progressX.value = 0;

    playerRef.current?.seek(0);

    AudioPlaybackManager.stop(
      controllerRef.current
    );
  };

  /**
   * FORMAT TIME
   */
  const formatTime = (
    seconds = 0
  ) => {
    const m = Math.floor(
      seconds / 60
    );

    const s = Math.floor(
      seconds % 60
    );

    return `${m}:${
      s < 10 ? "0" : ""
    }${s}`;
  };

  /**
   * SOURCE
   */
  const audioSource = isAudio
    ? {
        uri:
          message.file_url,
      }
    : {
        uri:
          message.music
            ?.streamUrl,
      };

  /**
   * PROGRESS STYLE
   */
  const progressStyle =
    useAnimatedStyle(() => {
      return {
        width: progressX.value,
      };
    });

  return (
    <View
      style={[
        styles.container,
        isMe &&
          styles.containerReverse,
      ]}
    >
      <Video
        ref={playerRef}
        source={audioSource}
        paused={!isPlaying}
        audioOnly
        style={styles.hiddenVideo}
        progressUpdateInterval={100}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        seekColor="transparent"
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        onLoad={(data) => {
          setIsLoaded(true);

          setDurationSec(
            data.duration
          );
        }}
        onProgress={onProgress}
        onEnd={onEnd}
      />

      {/* PLAY BUTTON */}
      <TouchableOpacity
        onPress={togglePlay}
        style={[
          styles.playBtn,
          isMe
            ? styles.playBtnMe
            : styles.playBtnOther,
        ]}
      >
        <Icon
          name={
            isPlaying
              ? "pause"
              : "play"
          }
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* MUSIC */}
      {isMusic && (
        <View
          style={styles.musicInfo}
        >
          <Image
            source={{
              uri:
                message.music.cover,
            }}
            style={styles.cover}
          />

          <View
            style={
              styles.musicText
            }
          >
            <AppText
              style={
                styles.title
              }
              numberOfLines={1}
            >
              {message.music.title}
            </AppText>

            <AppText
              style={
                styles.artist
              }
              numberOfLines={1}
            >
              {message.music.artist}
            </AppText>
          </View>
        </View>
      )}

      {/* AUDIO */}
      {isAudio && (
        <>
          <GestureDetector
            gesture={pan}
          >
            <View
              style={
                styles.waveformContainer
              }
            >
              {/* PROGRESS */}
              <Animated.View
                style={[
                  styles.progressFill,
                  progressStyle,
                  {
                    backgroundColor:
                      isMe
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(14,165,233,0.25)",
                  },
                ]}
              />

              {/* WAVEFORM */}
              <View
                style={
                  styles.waveform
                }
              >
                {waveform.map(
                  (amp, i) => {
                    const played =
                      i /
                        waveform.length <=
                      progress;

                    return (
                      <View
                        key={i}
                        style={[
                          styles.bar,
                          {
                            height:
                              MIN_BAR_HEIGHT +
                              amp *
                                (
                                  MAX_BAR_HEIGHT -
                                  MIN_BAR_HEIGHT
                                ),

                            backgroundColor:
                              played
                                ? isMe
                                  ? "#fff"
                                  : "#0EA5E9"
                                : isMe
                                ? "rgba(255,255,255,0.35)"
                                : "#9CA3AF",
                          },
                        ]}
                      />
                    );
                  }
                )}
              </View>
            </View>
          </GestureDetector>

          <AppText
            style={[
              styles.time,
              isMe &&
                styles.timeMe,
            ]}
          >
            {formatTime(
              progress *
                durationSec
            )}
          </AppText>
        </>
      )}
    </View>
  );
};

export default MediaMessage;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 10,
    justifyContent: "center",
  },

  containerReverse: {
    flexDirection: "row-reverse",
  },

  hiddenVideo: {
    width: 1,
    height: 1,
    opacity: 0,
    position: "absolute",
  },

  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  playBtnOther: {
    marginRight: 8,
  },

  playBtnMe: {
    marginLeft: 8,
  },

  waveformContainer: {
    width: WAVEFORM_WIDTH,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 10,
  },

  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },

  waveform: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },

  bar: {
    width: 3,
    marginHorizontal: 1.5,
    borderRadius: 999,
  },

  time: {
    fontSize: 10,
    marginLeft: 8,
    opacity: 0.7,
    color: "#fff",
  },

  timeMe: {
    marginLeft: 0,
    marginRight: 8,
  },

  musicInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: 240,
  },

  musicText: {
    flexShrink: 1,
  },

  cover: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 8,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  artist: {
    fontSize: 12,
    opacity: 0.7,
    color: "#fff",
  },
});