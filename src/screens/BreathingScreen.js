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
const SESSION_DURATION = 120; // 2 minutes

/* ------------------ SCREEN ------------------ */
const BreathingScreen = () => {
  const { theme } = useTheme();
  const videoRef = useRef(null);
  const navigation = useNavigation();

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

  // NEW
  const [auraVisible, setAuraVisible] = useState(false);

  /* ------------------ ANIMATION ------------------ */
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (!isPlaying) return;

    let timerId;
    let phaseTimeout;

    const half = (cycleDuration / 2) * 1000;

    const startCycle = () => {
      setPhase("Inhale");

      scale.value = withTiming(1, {
        duration: half,
        easing: Easing.inOut(Easing.ease),
      });

      phaseTimeout = setTimeout(() => {
        setPhase("Exhale");

        scale.value = withTiming(0.6, {
          duration: half,
          easing: Easing.inOut(Easing.ease),
        });
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

    const t = setInterval(() => {
      setElapsed((e) => {
        // SESSION COMPLETE
        if (e + 1 >= SESSION_DURATION) {
          clearInterval(t);

          setIsPlaying(false);
          setAuraVisible(true);

          scale.value = withTiming(0.6, { duration: 400 });
          setPhase("Complete");

          return SESSION_DURATION;
        }

        return e + 1;
      });
    }, 1000);

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
        `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(
          searchQuery
        )}`
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

  /* ------------------ START SESSION ------------------ */
  const handleSession = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Restart session if completed
    if (elapsed >= SESSION_DURATION) {
      setElapsed(0);
      setPhase("Inhale");
    }

    setIsPlaying(true);
  };

  /* ------------------ FORMAT TIMER ------------------ */
  const remaining = SESSION_DURATION - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  /* ------------------ UI ------------------ */
  return (
    <LinearGradient colors={["#0D1B2A", "#1B2C3A"]} style={{ flex: 1 }}>
      <LottieView
        source={LottieParticles}
        autoPlay
        loop
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.12,
        }}
      />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>2 Minute Breathing</Text>

        <TouchableOpacity onPress={() => setInfoVisible(true)}>
          <Icon name="info" size={22} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {/* TIMER */}
      <Text style={styles.timer}>
        {mins}:{secs.toString().padStart(2, "0")}
      </Text>

      <Text style={styles.sessionText}>
        Calm your body • Reset your energy
      </Text>

      {/* BREATHING CIRCLE */}
      <Animated.View style={[styles.phaseCircle, animatedStyle]}>
        <LinearGradient
          colors={
            phase === "Inhale"
              ? ["#00E5FF", "#A45EE5"]
              : ["#FF8C42", "#00FF7F"]
          }
          style={styles.gradientCircle}
        >
          <Text style={styles.phaseText}>{phase}</Text>
        </LinearGradient>
      </Animated.View>

      {/* CONTROLS */}
      {!isPlaying && elapsed < SESSION_DURATION && (
        <View style={styles.sliderWrapper}>
          <Text style={styles.sliderLabel}>
            Breathing Cycle · {cycleDuration}s
          </Text>

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
        <TouchableOpacity
          style={styles.musicBtn}
          onPress={() => setMusicModal(true)}
        >
          <Icon name="music" size={18} color="#0D1B2A" />
          <Text style={styles.musicText}>Choose Music</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handleSession}
      >
        <Text style={styles.actionText}>
          {isPlaying
            ? "Pause Session"
            : elapsed >= SESSION_DURATION
            ? "Start Again"
            : "Start Session"}
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
        />
      )}

      {/* INFO MODAL */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#0D1B2A", "#1B2C3A"]}
            style={styles.infoCard}
          >
            <Text style={styles.modalTitle}>Breathing Ritual</Text>

            <Text style={styles.modalText}>
              This 2 minute ritual is designed to calm your nervous system.
              {"\n\n"}
              Inhale with the expanding light.
              {"\n"}
              Exhale with the soft contraction.
              {"\n\n"}
              Let your breath guide you back to stillness.
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* MUSIC MODAL */}
      <Modal visible={musicModal} animationType="slide">
        <LinearGradient
          colors={["#0D1B2A", "#1B2C3A"]}
          style={{ flex: 1, padding: 16 }}
        >
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
                <TouchableOpacity
                  style={styles.songItem}
                  onPress={() => selectSong(item)}
                >
                  <Image
                    source={{ uri: item.image?.[2]?.url }}
                    style={styles.songImage}
                  />

                  <Text style={styles.songTitle}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.modalBtn}
            onPress={() => setMusicModal(false)}
          >
            <Text style={styles.modalBtnText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>

      {/* AURA CLAIM POPUP */}
    {/* SIMPLE SUCCESS MODAL */}
<Modal visible={auraVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <LinearGradient
      colors={["#111827", "#1F2937"]}
      style={styles.successCard}
    >
      <View style={styles.successGlow} />

      <Text style={styles.successEmoji}>✨</Text>

      <Text style={styles.successTitle}>
        Session Complete
      </Text>

      <Text style={styles.successText}>
        You completed your 2 minute breathing ritual.
        {"\n\n"}
        Your mind feels calmer.
        {"\n"}
        Your energy feels lighter.
      </Text>

      <TouchableOpacity
        style={styles.claimBtn}
        onPress={() => {
          setAuraVisible(false);
          setElapsed(0);
          setPhase("Inhale");
        }}
      >
        <LinearGradient
          colors={["#00E5FF", "#8B5CF6"]}
          style={styles.claimGradient}
        >
          <Text style={styles.claimText}>
            Claim Your Aura
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  </View>
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

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  timer: {
    fontSize: 58,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },

  sessionText: {
    textAlign: "center",
    color: "#9FB3C8",
    marginBottom: 20,
    fontSize: 15,
  },

  phaseCircle: {
    alignSelf: "center",
    width: 210,
    height: 210,
    borderRadius: 105,
    shadowColor: "#00E5FF",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },

  gradientCircle: {
    flex: 1,
    borderRadius: 105,
    justifyContent: "center",
    alignItems: "center",
  },

  phaseText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  sliderWrapper: {
    marginTop: 28,
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

  musicText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#0D1B2A",
  },

  actionBtn: {
    marginTop: 34,
    alignSelf: "center",
    backgroundColor: "#A45EE5",
    paddingHorizontal: 55,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: "#A45EE5",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  infoCard: {
    width: "85%",
    borderRadius: 28,
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
    lineHeight: 24,
  },

  modalBtn: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#00E5FF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },

  modalBtnText: {
    fontWeight: "600",
    color: "#0D1B2A",
  },

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

  songImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },

  songTitle: {
    color: "#fff",
    fontWeight: "600",
  },

  /* AURA POPUP */
/* SIMPLE SUCCESS MODAL */
successCard: {
  width: "84%",
  borderRadius: 32,
  paddingVertical: 34,
  paddingHorizontal: 24,
  alignItems: "center",
  overflow: "hidden",
  position: "relative",
},

successGlow: {
  position: "absolute",
  top: -60,
  width: 180,
  height: 180,
  borderRadius: 100,
  backgroundColor: "rgba(0,229,255,0.12)",
},

successEmoji: {
  fontSize: 42,
  marginBottom: 12,
},

successTitle: {
  fontSize: 28,
  fontWeight: "800",
  color: "#fff",
  marginBottom: 14,
},

successText: {
  fontSize: 16,
  color: "#CBD5E1",
  textAlign: "center",
  lineHeight: 25,
},

claimBtn: {
  marginTop: 30,
  width: "100%",
  borderRadius: 40,
  overflow: "hidden",
},

claimGradient: {
  paddingVertical: 16,
  alignItems: "center",
  borderRadius: 40,
},

claimText: {
  color: "#fff",
  fontSize: 17,
  fontWeight: "800",
  letterSpacing: 0.5,
},
});   