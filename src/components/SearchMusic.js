import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Video from "react-native-video";
import { useTheme } from "../constants/context/ThemeContext";
import AppText from "./AppText";

const MusicPickerModal = ({ visible, onClose, handleSend }) => {
  const { theme } = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const playerRef = useRef(null);
  const searchTimeout = useRef(null);

  // Stop music when modal closes
  useEffect(() => {
    if (!visible) {
      stopMusic();
      setQuery("");
      setResults([]);
    }
  }, [visible]);

  // ----------------------------------
  // 🔍 SEARCH MUSIC
  // ----------------------------------
  useEffect(() => {
    if (!query) {
      stopMusic();
      setResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            query
          )}&entity=musicTrack&limit=20`
        );
        const data = await res.json();

        const mapped = (data.results || []).map(track => ({
          id: track.trackId,
          title: track.trackName,
          artist: track.artistName,
          cover: track.artworkUrl100?.replace("100x100", "300x300"),
          streamUrl: track.previewUrl,
        }));

        setResults(mapped);
      } catch (e) {
        console.log("Music search error", e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  // ----------------------------------
  // ▶️ PLAY / PAUSE PREVIEW
  // ----------------------------------
  const togglePlay = (song) => {
    if (playingId === song.id) {
      stopMusic();
    } else {
      setPlayingId(song.id);
      setPreviewUrl(song.streamUrl);
    }
  };

  const stopMusic = () => {
    setPlayingId(null);
    setPreviewUrl(null);
    if (playerRef.current) {
      playerRef.current.seek(0);
    }
  };

  // ----------------------------------
  // 🎧 SEND SONG
  // ----------------------------------
  const onSend = (song) => {
    handleSend(song);
    onClose();
  };

  // ----------------------------------
  // 🎨 RENDER ITEM
  // ----------------------------------
  const renderItem = ({ item }) => (
    <View style={[styles.musicItem, { backgroundColor: theme.components.card, opacity: theme.opacity.light }]}>
      <Image source={{ uri: item.cover }} style={styles.musicImage} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={[styles.musicTitle, { color: theme.text.primary }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[styles.musicArtist, { color: theme.text.secondary }]}>
          {item.artist}
        </Text>
      </View>

      <TouchableOpacity onPress={() => togglePlay(item)} style={{ marginRight: 12 }}>
        <Feather
          name={playingId === item.id ? "pause-circle" : "play-circle"}
          size={26}
          color={theme.text.accent}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onSend(item)}>
        <Feather name="send" size={22} color={theme.text.accent} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <AppText style={[styles.headerTitle, { color: theme.text.primary,marginLeft:8 }]} variant="h4">Send Music</AppText>
            <TouchableOpacity onPress={onClose} style={{marginRight:20}}>
              <Feather name="x" size={28} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <View style={[styles.searchContainer, { backgroundColor: theme.components.card, opacity: theme.opacity.light }]}>
            <Feather name="search" size={18} color={theme.text.secondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search music..."
              placeholderTextColor={theme.text.secondary}
              style={[styles.searchInput, { color: theme.text.primary }]}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Feather name="x-circle" size={18} color={theme.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* RESULTS */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={theme.text.accent} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {/* AUDIO */}
          {previewUrl && (
            <Video
              ref={playerRef}
              source={{ uri: previewUrl }}
              paused={false}
              audioOnly
              style={{ height: 0, width: 0 }}
              onEnd={stopMusic}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MusicPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  musicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    padding: 12,
  },
  musicImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  musicArtist: {
    fontSize: 14,
  },
});
