// src/screens/BreathingScreen.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import LottieView from "lottie-react-native";
import LinearGradient from "react-native-linear-gradient";
import Video from "react-native-video";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../constants/context/ThemeContext";
import LottieParticles from "../assets/particles.json";
import { useNavigation } from "@react-navigation/native";

/* ------------------ CONSTANTS ------------------ */
const MUSIC_CACHE_KEY = "breathing_music_cache";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

/* ------------------ SCREEN ------------------ */
const BreathingScreen = () => {
  const { theme } = useTheme();
  const videoRef = useRef(null);
  const navigation=useNavigation()
  /* ------------------ STATES ------------------ */
  const [isPlaying, setIsPlaying] = useState(false);
  const [cycleDuration, setCycleDuration] = useState(6);
  const [phase, setPhase] = useState("Inhale");

  const [elapsed, setElapsed] = useState(0);

  const [currentSong, setCurrentSong] = useState(null);
  const [musicLocked, setMusicLocked] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [infoVisible, setInfoVisible] = useState(false);
  const [musicModal, setMusicModal] = useState(false);

  /* ------------------ ANIMATION ------------------ */
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (!isPlaying) return;

    let timerId;
    let phaseTimeout;

    const half = (cycleDuration / 2) * 1000;

    const startCycle = () => {
      setPhase("Inhale");
      scale.value = withTiming(1, { duration: half, easing: Easing.inOut(Easing.ease) });

      phaseTimeout = setTimeout(() => {
        setPhase("Exhale");
        scale.value = withTiming(0.6, { duration: half, easing: Easing.inOut(Easing.ease) });
      }, half);
    };

    startCycle();
    timerId = setInterval(startCycle, cycleDuration * 1000);

    return () => {
      clearInterval(timerId);
      clearTimeout(phaseTimeout);
    };
  }, [isPlaying, cycleDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.6, 1], [0.7, 1]),
  }));

  /* ------------------ TIMER ------------------ */
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [isPlaying]);

  /* ------------------ LOAD CACHED MUSIC ------------------ */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(MUSIC_CACHE_KEY);
      if (!raw) return;

      const cache = JSON.parse(raw);
      if (Date.now() - cache.fetchedAt < SEVEN_DAYS) {
        setCurrentSong(cache.song);
        setMusicLocked(true);
      }
    })();
  }, []);

  /* ------------------ MUSIC SEARCH ------------------ */
  const searchAudio = async () => {
    if (!searchQuery) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(res.data.data.results || []);
    } finally {
      setLoading(false);
    }
  };

  const selectSong = async (song) => {
    const payload = { song, fetchedAt: Date.now() };
    await AsyncStorage.setItem(MUSIC_CACHE_KEY, JSON.stringify(payload));
    setCurrentSong(song);
    setMusicLocked(true);
    setMusicModal(false);
  };

  const audioUrl = currentSong?.downloadUrl?.[0]?.url;

  /* ------------------ UI ------------------ */
  return (
    <LinearGradient colors={["#0D1B2A", "#1B2C3A"]} style={{ flex: 1 }}>
      <LottieView
        source={LottieParticles}
        autoPlay
        loop
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.12 }}
      />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={()=>{navigation.goBack()}}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Breathing</Text>

        <TouchableOpacity onPress={() => setInfoVisible(true)}>
          <Icon name="info" size={22} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {/* TIMER */}
      <Text style={styles.timer}>
        {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
      </Text>

      {/* BREATHING CIRCLE */}
      <Animated.View style={[styles.phaseCircle, animatedStyle]}>
        <LinearGradient
          colors={phase === "Inhale" ? ["#00E5FF", "#A45EE5"] : ["#FF8C42", "#00FF7F"]}
          style={styles.gradientCircle}
        >
          <Text style={styles.phaseText}>{phase}</Text>
        </LinearGradient>
      </Animated.View>

      {/* CONTROLS */}
      {!isPlaying && (
        <View style={styles.sliderWrapper}>
          <Text style={styles.sliderLabel}>Breathing Cycle · {cycleDuration}s</Text>
          <Slider
            minimumValue={4}
            maximumValue={12}
            step={1}
            value={cycleDuration}
            onValueChange={setCycleDuration}
            minimumTrackTintColor="#00E5FF"
            maximumTrackTintColor="#2C3E50"
          />
        </View>
      )}

      {!musicLocked && (
        <TouchableOpacity style={styles.musicBtn} onPress={() => setMusicModal(true)}>
          <Icon name="music" size={18} color="#0D1B2A" />
          <Text style={styles.musicText}>Choose Music</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setIsPlaying(p => !p)}
      >
        <Text style={styles.actionText}>
          {isPlaying ? "Pause Session" : "Start Session"}
        </Text>
      </TouchableOpacity>

      {/* AUDIO */}
      {currentSong && audioUrl && (
        <Video
          ref={videoRef}
          source={{ uri: audioUrl }}
          paused={!isPlaying}
          audioOnly
          repeat
          onEnd={() => {
            setIsPlaying(false);
            scale.value = 0.6;
            setPhase("Inhale");
          }}
        />
      )}

      {/* INFO MODAL */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={["#0D1B2A", "#1B2C3A"]} style={styles.infoCard}>
            <Text style={styles.modalTitle}>Breathing Ritual</Text>
            <Text style={styles.modalText}>
              This space is designed to calm your nervous system.
              {"\n\n"}
              Follow the expanding circle as you inhale.
              Follow the contraction as you exhale.
              {"\n\n"}
              Let the rhythm guide your body back to stillness.

            </Text>
             <Text style={styles.modalText}>
              You can Select Music Once per week, purchase premium to select music daily.
              
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* MUSIC MODAL */}
      <Modal visible={musicModal} animationType="slide">
        <LinearGradient colors={["#0D1B2A", "#1B2C3A"]} style={{ flex: 1, padding: 16 }}>
          <Text style={styles.modalTitle}>Choose Music</Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search calming music..."
            placeholderTextColor="#8899AA"
            style={styles.searchInput}
            onSubmitEditing={searchAudio}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#00E5FF" />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.songItem} onPress={() => selectSong(item)}>
                  <Image source={{ uri: item.image?.[2]?.url }} style={styles.songImage} />
                  <Text style={styles.songTitle}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.modalBtn} onPress={() => setMusicModal(false)}>
            <Text style={styles.modalBtnText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
};

export default BreathingScreen;

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#fff" },

  timer: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginVertical: 12,
  },

  phaseCircle: { alignSelf: "center", width: 190, height: 190, borderRadius: 95 },
  gradientCircle: { flex: 1, borderRadius: 95, justifyContent: "center", alignItems: "center" },
  phaseText: { fontSize: 22, fontWeight: "700", color: "#fff" },

  sliderWrapper: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sliderLabel: {
    textAlign: "center",
    color: "#B8C1CC",
    marginBottom: 8,
  },

  musicBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#00E5FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  musicText: { marginLeft: 8, fontWeight: "600", color: "#0D1B2A" },

  actionBtn: {
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#A45EE5",
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 40,
  },
  actionText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    width: "85%",
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: "#B8C1CC",
    lineHeight: 22,
  },
  modalBtn: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#00E5FF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },
  modalBtnText: { fontWeight: "600", color: "#0D1B2A" },

  searchInput: {
    borderWidth: 1,
    borderColor: "#00E5FF",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 44,
    color: "#fff",
    marginBottom: 16,
  },

  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  songImage: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  songTitle: { color: "#fff", fontWeight: "600" },
});
