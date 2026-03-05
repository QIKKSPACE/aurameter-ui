import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


export default function MusicSearchModal({ visible, onClose, onSelectTrack, theme }) {
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!musicQuery) {
      setMusicResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsLoadingMusic(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            musicQuery
          )}&entity=musicTrack&limit=25`
        );
        const data = await res.json();
        const results = (data.results || []).map((track) => ({
          id: track.trackId,
          title: track.trackName,
          artist: track.artistName,
          cover: track.artworkUrl100?.replace("100x100", "300x300"),
          streamUrl: track.previewUrl,
        }));
        setMusicResults(results);
      } catch (e) {
        console.log("Music search error", e);
      } finally {
        setIsLoadingMusic(false);
      }
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [musicQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.components.card }]}>
          <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={26} color="white" />
        </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            Search Music
          </Text>
          <TextInput
            value={musicQuery}
            onChangeText={setMusicQuery}
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Search songs or artists"
            placeholderTextColor="#999"
          />
          {isLoadingMusic ? (
            <ActivityIndicator color={theme.text.accent} />
          ) : (
            <FlatList
              data={musicResults}
              keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelectTrack(item); // pass selected track
                    onClose();
                  }}
                  style={styles.musicItem}
                >
                  <Image source={{ uri: item.cover }} style={styles.musicImage} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.musicTitle, { color: theme.text.primary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.musicArtist}>{item.artist}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  resultsList: {
    marginTop: 8,
  },
  musicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  musicImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  musicArtist: {
    fontSize: 14,
    color: "#aaa",
  },
});
