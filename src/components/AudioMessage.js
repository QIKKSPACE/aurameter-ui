import React, { useRef, useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AudioPlaybackManager from "./AudioPlaybackManager";
import AppText from "./AppText";

const MAX_BARS = 32;
const MIN_BAR_HEIGHT = 10;
const MAX_BAR_HEIGHT = 26;

const MediaMessage = ({ message, isMe }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const isAudio = message.message_type === "audio";  
  const isMusic = message.message_type === "music";

  const waveform = useMemo(() => {
    if (!isAudio || !message.waveform) return [];
    const bars = message.waveform.slice(0, MAX_BARS);
    return isMe ? [...bars].reverse() : bars; // 🔁 reverse bars for sender
  }, [message, isMe]);

  const togglePlay = () => {
    if (!isPlaying) {
      AudioPlaybackManager.play({
        pause: () => {
          setIsPlaying(false);
          playerRef.current?.pause?.();
        },
      });
    }
    setIsPlaying(p => !p);
  };

  const onProgress = ({ currentTime }) => {
    if (!message.duration) return;
    setProgress(Math.min(1, currentTime / message.duration));
  };

  const onEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    playerRef.current?.seek(0);
    AudioPlaybackManager.stop(playerRef);
  };

  const formatTime = (s = 0) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const audioSource = isAudio
    ? { uri: message.file_url }
    : { uri: message.music.streamUrl };

  return (
    <View
      style={[
        styles.container,
        isMe && styles.containerReverse, // 🔁 layout flip
      ]}
    >
      {/* 🔊 Shared Audio Player */}
      <Video
        ref={playerRef}
        source={audioSource}
        paused={!isPlaying}
        onProgress={onProgress}
        onEnd={onEnd}
        audioOnly
        style={{ width: 0, height: 0 }}
      />

      {/* ▶️ Play / Pause */}
      <TouchableOpacity
        onPress={togglePlay}
        style={[
          styles.playBtn,
          isMe ? styles.playBtnMe : styles.playBtnOther,
        ]}
      >
        <Icon
          name={isPlaying ? "pause" : "play"}
          size={30}
          color="#fff"
        />
      </TouchableOpacity>

      {/* 🎵 MUSIC */}
      {isMusic && (
        <View style={styles.musicInfo}>
          <Image source={{ uri: message.music.cover }} style={styles.cover} />
          <View style={{ flexShrink: 1 }}>
            <AppText style={styles.title} numberOfLines={1}>
              {message.music.title}
            </AppText>
            <AppText style={styles.artist} numberOfLines={1}>
              {message.music.artist}
            </AppText>
          </View>
        </View>
      )}

      {/* 🎙️ AUDIO */}
      {isAudio && (
        <>
          <View style={styles.waveform}>
            {waveform.map((amp, i) => {
              const played = i / waveform.length <= progress;
              return (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height:
                        MIN_BAR_HEIGHT +
                        amp * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT),
                      backgroundColor: played
                        ? isMe
                          ? "#fff"
                          : "#111"
                        : "#9CA3AF",
                    },
                  ]}
                />
              );
            })}
          </View>

          <AppText
            style={[
              styles.time,
              isMe && styles.timeMe,
            ]}
          >
            {formatTime(progress * message.duration)}
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

  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  playBtnOther: {
    marginRight: 8,
  },

  playBtnMe: {
    marginLeft: 8,
  },

  /* AUDIO */
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    overflow: "hidden",
  },

  bar: {
    width: 2,
    marginHorizontal: 1.5,
    borderRadius: 2,
  },

  time: {
    fontSize: 10,
    marginLeft: 8,
    opacity: 0.6,
    color: "#fff",
  },

  timeMe: {
    marginLeft: 0,
    marginRight: 8,
  },

  /* MUSIC */
  musicInfo: {
    flexDirection: "row",
    alignItems: "center",
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
