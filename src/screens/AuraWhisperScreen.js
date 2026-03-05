// screens/AuraWhisperScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import LinearGradient from "react-native-linear-gradient";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import axios from "axios";

// Dummy follower (system picks one)
const pickedUser = {
  name: "Sophia",
  image: "https://picsum.photos/200/200?random=22",
  aura: 1280,
};

const AuraWhisperScreen = () => {
  const { theme } = useTheme();
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const hasEnoughFollowers = true; // set false to test locked state

  const searchSongs = async () => {
    if (!searchQuery) return;
    try {
      const response = await axios.get(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          searchQuery
        )}&entity=song&limit=20`
      );

      const results = response.data?.results || [];
      setSearchResults(results);
    } catch (error) {
      console.error("iTunes search failed:", error.message);
    }
  };

  const renderSongItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => setSelectedSong(item)}
      >
        <Image
          source={{ uri: item.artworkUrl100 }}
          style={styles.songImage}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={[styles.songTitle, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {item.trackName}
          </Text>
          <Text
            style={[styles.songArtist, { color: theme.text.secondary }]}
            numberOfLines={1}
          >
            {item.artistName}
          </Text>
        </View>
        <Icon name="plus-circle" size={22} color={theme.text.accent} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <View  style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Aura Whisper ✨
          </Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Icon name="info" size={22} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {!hasEnoughFollowers ? (
          // Locked UI
          <View style={styles.centered}>
            <Image
              source={{ uri: "https://picsum.photos/300/300?random=45" }}
              style={styles.lockedImage}
            />
            <Text style={[styles.lockedText, { color: theme.text.primary }]}>
              Gain 10+ followers to unlock Aura Whisper
            </Text>
            <Text style={[styles.lockedSub, { color: theme.text.secondary }]}>
              Once unlocked, you can send one anonymous note each day 💌
            </Text>
          </View>
        ) : sent ? (
          // Success Screen
          <View style={styles.centered}>
            <Icon name="check-circle" size={60} color="#00FF7F" />
            <Text style={[styles.successText, { color: theme.text.primary }]}>
              Whisper sent anonymously 🌙
            </Text>
            <Text style={[styles.lockedSub, { color: theme.text.secondary }]}>
              Come back tomorrow to send another.
            </Text>
          </View>
        ) : (
          // Main Whisper UI
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Picked user card */}
            <LinearGradient
              colors={["#00E5FF40", "#A45EE540"]}
              style={styles.userCard}
            >
              <Image source={{ uri: pickedUser.image }} style={styles.avatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.userName, { color: theme.text.primary }]}>
                  {pickedUser.name}
                </Text>
                <Text
                  style={[styles.userAura, { color: theme.text.secondary }]}
                >
                  Aura Score: {pickedUser.aura}
                </Text>
              </View>
            </LinearGradient>

            {/* Note input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Write your anonymous note..."
                placeholderTextColor={theme.text.secondary}
                style={[
                  styles.textInput,
                  {
                    color: theme.text.primary,
                    backgroundColor: theme.components.card,
                  },
                ]}
                multiline
              />
            </View>

            {/* Selected song preview */}
            {selectedSong && (
              <View style={styles.selectedSongCard}>
                <Image
                  source={{ uri: selectedSong.artworkUrl100 }}
                  style={styles.songImage}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[styles.songTitle, { color: theme.text.primary }]}
                    numberOfLines={1}
                  >
                    {selectedSong.trackName}
                  </Text>
                  <Text
                    style={[styles.songArtist, { color: theme.text.secondary }]}
                    numberOfLines={1}
                  >
                    {selectedSong.artistName}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSong(null)}>
                  <Icon name="x-circle" size={22} color="#FF4C4C" />
                </TouchableOpacity>
              </View>
            )}

            {/* Song search */}
            <View style={styles.searchWrapper}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search music to attach..."
                placeholderTextColor={theme.text.secondary}
                style={[
                  styles.searchInput,
                  { color: theme.text.primary, borderColor: theme.text.accent },
                ]}
                onSubmitEditing={searchSongs}
              />
              <TouchableOpacity onPress={searchSongs} style={styles.searchBtn}>
                <Icon name="search" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              renderItem={renderSongItem}
              keyExtractor={(item) => String(item.trackId)}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            />

            {/* Send button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (note.trim().length > 0) setSent(true);
              }}
            >
              <LinearGradient
                colors={["#00E5FF", "#A45EE5"]}
                style={styles.sendGradient}
              >
                <Icon name="send" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}

        {/* Instructions Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>How Aura Whisper Works 🌌</Text>
              <Text style={styles.modalStep}>
                1. System picks a random follower for you each day.
              </Text>
              <Text style={styles.modalStep}>
                2. Write your secret anonymous note ✍️
              </Text>
              <Text style={styles.modalStep}>
                3. Attach a song to amplify the feeling 🎵
              </Text>
              <Text style={styles.modalStep}>
                4. Send it — they’ll feel your aura without knowing it’s you ✨
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenBackground>
  );
};

export default AuraWhisperScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", fontFamily: "Orbitron" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  userName: { fontSize: 18, fontWeight: "600" },
  userAura: { fontSize: 13, marginTop: 4 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  lockedImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20,
  },
  lockedText: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  lockedSub: { fontSize: 14, marginTop: 6, textAlign: "center" },
  inputContainer: { marginTop: 15, marginHorizontal: 20 },
  textInput: {
    minHeight: 100,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },
  searchWrapper: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 44,
  },
  searchBtn: {
    marginLeft: 8,
    backgroundColor: "#00E5FF",
    borderRadius: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  songImage: { width: 50, height: 50, borderRadius: 8 },
  songTitle: { fontSize: 15, fontWeight: "600" },
  songArtist: { fontSize: 12, fontWeight: "400" },
  selectedSongCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#1B263B",
  },
  sendButton: {
    position: "absolute",
    right: 30,
    bottom: 100,
  },
  sendGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  successText: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1B263B",
    borderRadius: 16,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#fff",
  },
  modalStep: { fontSize: 14, marginVertical: 4, color: "#ddd" },
  closeBtn: {
    backgroundColor: "#A45EE5",
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
});
