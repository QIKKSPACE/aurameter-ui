// StoryUploadScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  NativeModules,
} from "react-native";
const { WorkManagerModule } = NativeModules; // keep if you use it later

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import Video from "react-native-video";
import { useTheme } from "../constants/context/ThemeContext";
import * as Animatable from "react-native-animatable";
import MarqueeText from "../components/MarqueeText";
import { uuidv4 } from "../utils/uuid";
import { useDispatch, useSelector } from "react-redux";
import {
  addStoryOptimistic,
  storyUploadFailure,
  storyUploadSuccess,
} from "../store/storySlice";
import { addToUploadQueue, removeFromUploadQueue } from "../utils/UploadQueue"; // <- imported removeFromUploadQueue
import {createStoryObject} from '../utils/createStoryObject'
const StoryUploadScreen = ({ route }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { imageUri } = route.params;

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [musicResults, setMusicResults] = useState([]);
  const [musicQuery, setMusicQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [musicUrl, setMusicUrl] = useState(null);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);

  const searchTimeout = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const accessToken = useSelector((state) => state.user.token);
  const userdata = useSelector((state) => state.user.userData || {});
  const dispatch = useDispatch();

  // Keep the timeout id so we can optionally cancel it later.
  const uploadTimeoutRef = useRef(null);

  // --- Search Locations ---
  useEffect(() => {

    if (!locationQuery) {
        setLocationResults([]); return;
    };
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsLoadingLocation(true);
      try {
        const res = await fetch(
          `https://api.aurameter.in/places?query=${encodeURIComponent(locationQuery)}`
        );
        if (!res.ok) throw new Error("Failed to fetch places");
        const data = await res.json();
        setLocationResults(data);
      } catch (e) {
        console.log("Location search error", e);
        setLocationResults([]);
      } finally {
        setIsLoadingLocation(false);
      }
    }, 400);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [locationQuery]);

  // --- Search Music ---
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

  // --- Toggle Music ---
  const toggleMusic = () => {
    if (!musicUrl) return;
    if (!isPlaying && playerRef.current) {
      try {
        playerRef.current.seek(0);
      } catch {}
    }
    setIsPlaying((prev) => !prev);
  };

  // --- Upload Placeholder (fixed) ---
  const handleUpload=async()=>{
    try {
       const filePath = imageUri;
           const type = "image";
    const paylaod={userId:userdata?.id,mediaUrl:filePath,type,music:selectedTrack}
     const storyObject=  createStoryObject(paylaod)
      const storyId = null; // unique ID
     const local_id=storyObject.local_id; // unique ID

      if(!local_id){return ;}
      const caption = "";
     const userId=userdata?.id
     const userDataStry={user_id:  userdata.id,
          username: userdata.username, // ensure this exists
          email: userdata.email,
          aura: userdata.aura || 0,
          avatar: userdata.avatar || null,}
          const musicUrlJson = JSON.stringify(storyObject.music);
           // await addToUploadQueue(storyObject);
             dispatch(
        addStoryOptimistic({
       
          userData:userDataStry,
          story: storyObject,
        })
      );
         navigation.reset({
  index: 0,
  routes: [{ name: "MainTabs" }],
});
       /*const result = await WorkManagerModule.scheduleStoryUpload(
        local_id,
  filePath,
    caption,
  type,
  userId,
  musicUrlJson,
  selectedLocation,
  accessToken
);*/
    } catch (error) {
      console.log(error)
    }
      


  }

  // OPTIONAL: if you want to cancel the simulated upload when this screen unmounts,
  // uncomment the clearTimeout below. Currently we keep it so callback fires after navigation.
  useEffect(() => {
    return () => {
      // If you DO want to cancel the simulated upload on unmount, uncomment:
      // if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.safeArea} >
      <View style={styles.container}>
        {/* Fullscreen Image */}
        <Image source={{ uri: imageUri }} style={styles.storyImage} />

        {/* Back + Location Tag */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.components.overlay }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={22} color={theme.text.primary} />
          </TouchableOpacity>

          {selectedLocation !== "" && (
            <Animatable.View animation="fadeIn" style={[styles.locationTag]}>
              <MarqueeText text={`${selectedLocation}`} width={180} />
              <TouchableOpacity onPress={() => setSelectedLocation("")} style={{ marginLeft: 5 }}>
                <Icon name="trash" size={22} color={theme.text.primary} />
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.components.overlay }]}>
          <View style={styles.iconWrapper}>
            <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
              <Icon name="map" size={28} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMusicPicker(true)}>
              <Icon name="music" size={28} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.uploadButton, { backgroundColor: "purple" }]} onPress={handleUpload}>
            <Text style={styles.uploadText}>Send Story ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Location Modal */}
        <Modal visible={showLocationPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.components.card }]}>
              <CloseButton onPress={() => setShowLocationPicker(false)} />
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Search Location</Text>
              <TextInput
                placeholder="Enter a place..."
                placeholderTextColor="#999"
                style={[styles.searchInput, { color: theme.text.primary }]}
                value={locationQuery}
                onChangeText={setLocationQuery}
              />
              {isLoadingLocation ? (
                <ActivityIndicator color={theme.text.accent} />
              ) : (
                <ScrollView style={styles.resultsList}>
                  {locationResults.map((loc, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedLocation(loc.description);
                        setShowLocationPicker(false);
                      }}
                      style={styles.locationItem}
                    >
                      <Text style={{ color: theme.text.primary }}>{loc.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Music Modal */}
        <Modal visible={showMusicPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.components.card }]}>
              <CloseButton onPress={() => setShowMusicPicker(false)} />
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Search Music</Text>
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
                        setMusicUrl(item.streamUrl);
                        setSelectedTrack(item);
                        setShowMusicPicker(false);
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

        {/* Music Preview */}
        {selectedTrack && (
          <Animatable.View animation="fadeInUp" style={styles.musicPreview}>
            <TouchableOpacity onPress={toggleMusic} style={styles.musicPreviewContent}>
              <Image source={{ uri: selectedTrack.cover }} style={styles.musicPreviewImage} />
              <View style={styles.musicPreviewText}>
                <Text style={styles.musicPreviewTitle}>{selectedTrack.title}</Text>
                <Text style={styles.musicPreviewArtist}>{selectedTrack.artist}</Text>
              </View>
              <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedTrack(null);
                setMusicUrl(null);
                setIsPlaying(false);
              }}
            >
              <Icon name="trash" size={28} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Hidden Music Player */}
        {musicUrl && (
          <Video ref={playerRef} source={{ uri: musicUrl }} paused={!isPlaying} audioOnly onEnd={() => setIsPlaying(false)} style={{ height: 0, width: 0 }} />
        )}
      </View>
    </View>
  );
};

const CloseButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.closeButton}>
    <Icon name="x-square" size={22} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "black" },
  container: { flex: 1 },
  storyImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, resizeMode: "contain" },
  topBar: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { padding: 10, borderRadius: 50 },
  locationTag: { flexDirection: "row", alignItems: "center", maxWidth: 200 },
  locationText: { marginLeft: 8, fontSize: 12 },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "absolute",
    bottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  iconWrapper: { flexDirection: "row", gap: 20 },
  uploadButton: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  uploadText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "center", padding: 20 },
  modalContent: { borderRadius: 12, padding: 20, marginTop: 0, maxHeight: "80%" },
  modalTitle: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  searchInput: { backgroundColor: "#444", padding: 10, borderRadius: 8, fontSize: 16, marginBottom: 10 },
  resultsList: { marginTop: 10, maxHeight: 500 },
  locationItem: { paddingVertical: 10, borderBottomColor: "#555", borderBottomWidth: 1 },
  musicItem: { flexDirection: "row", alignItems: "center", marginVertical: 6, backgroundColor: "#444", padding: 10, borderRadius: 10 },
  musicImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#666" },
  musicTitle: { fontSize: 14, fontWeight: "bold" },
  musicArtist: { color: "#ccc", fontSize: 14 },
  musicPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 80,
    width: "90%",
    alignSelf: "center",
    justifyContent: "space-between",
  },
  musicPreviewContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  musicPreviewImage: { width: 50, height: 50, borderRadius: 8 },
  musicPreviewText: { flex: 1, marginLeft: 10 },
  musicPreviewTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  musicPreviewArtist: { color: "#ccc", fontSize: 14 },
  closeButton: { position: "absolute", right: 10, top: 10, zIndex: 1, padding: 6 },
});

export default StoryUploadScreen;
