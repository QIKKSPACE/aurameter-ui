import React, { memo, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Feather";

function MusicPreview({ story, paused, visible, onClose, onTogglePause }) {
  if (!story?.music) return null;

  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    cancelAnimation(translateY);
    cancelAnimation(opacity);

    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(40, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.musicPreview, animatedStyle]}
    >
      <Image
        source={{ uri: story.music.cover }}
        style={styles.musicPreviewImage}
      />

      <View style={styles.musicPreviewText}>
        <Text numberOfLines={1} style={styles.musicPreviewTitle}>
          {story.music.title}
        </Text>
        <Text numberOfLines={1} style={styles.musicPreviewArtist}>
          {story.music.artist}
        </Text>
      </View>

      <TouchableOpacity onPress={onTogglePause} hitSlop={10}>
        <Icon
          name={paused ? "play-circle" : "pause-circle"}
          size={32}
          color="#fff"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} hitSlop={10}>
        <Icon name="x" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(MusicPreview);


const styles = StyleSheet.create({
  musicPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 150,
    width: "75%",
    left: 10,
    gap: 10,
  },
  musicPreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  musicPreviewText: {
    flex: 1,
  },
  musicPreviewTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  musicPreviewArtist: {
    color: "#ccc",
    fontSize: 13,
  },
});
