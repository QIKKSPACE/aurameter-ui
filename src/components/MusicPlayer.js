import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function MusicPlayer({ title, artist, isBuffering, isPlaying, onTogglePlay }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1}>
        🎵 {title} — {artist} {isBuffering ? "• Buffering…" : ""}
      </Text>
      <TouchableOpacity onPress={onTogglePlay} style={styles.iconBtn}>
        <Icon name={isPlaying ? "pause" : "play"} size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 13, flex: 1, marginRight: 10 },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 6,
    borderRadius: 20,
  },
});
