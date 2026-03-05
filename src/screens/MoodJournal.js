// src/screens/MoodJournalScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  AppState,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import LinearGradient from "react-native-linear-gradient";

const STORAGE_KEY = "MOOD_JOURNAL_ENTRIES";

const MoodJournalScreen = () => {
  const { theme } = useTheme();

  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [infoVisible, setInfoVisible] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [entries, setEntries] = useState([]);

  const appState = useRef(AppState.currentState);

  const moods = ["😀", "😌", "😍", "😔", "😡", "🤔"];

  /* ───────── Time Formatting ───────── */

  const formatTime = (date) =>
    date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  /* ───────── Live Clock (per second) ───────── */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ───────── Foreground Reset ───────── */

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        setCurrentTime(new Date());
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  /* ───────── Load Stored Entries ───────── */

  useEffect(() => {
     //AsyncStorage.removeItem(STORAGE_KEY);
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) setEntries(JSON.parse(stored));
  };

  /* ───────── Submit Entry ───────── */

  const handleSubmit = async () => {
    if (selectedMood === null || !note.trim()) return;

    const entry = {
      id: Date.now().toString(),
      mood: moods[selectedMood],
      note,
      timestamp: new Date().toISOString(), // LOCKED
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setNote("");
    setSelectedMood(null);
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="arrow-left" size={22} color={theme.text.primary} />
            <Text
              style={[
                styles.title,
                { color: theme.text.primary, marginLeft: 10 },
              ]}
            >
              Mood Journal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setInfoVisible(true)}>
            <Icon name="info" size={22} color="#00E5FF" />
          </TouchableOpacity>
        </View>

        {/* Mood Card */}
        <View style={styles.cardWrapper}>
          <View
            style={[
              styles.glowLayer,
              { backgroundColor: theme.gradients.tab[1] },
            ]}
          />
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.components.card,
                borderColor: theme.components.border,
              },
            ]}
          >
            <Text
              style={[styles.questionText, { color: theme.text.primary }]}
            >
              What’s your mood today?
            </Text>

            {/* Live Clock */}
            <Text style={[styles.dateText, { color: theme.text.primary }]}>
              {formatTime(currentTime)}
            </Text>

            {/* Input Box */}
            <TextInput
              placeholder="Write your thoughts..."
              placeholderTextColor={theme.text.secondary}
              value={note}
              onChangeText={setNote}
              style={[
                styles.inputBox,
                {
                  backgroundColor: theme.components.box,
                  color: theme.text.primary,
                },
              ]}
            />

            {/* Mood options */}
            <View style={styles.moodRow}>
              {moods.map((mood, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.moodOption,
                    {
                      borderColor:
                        selectedMood === idx
                          ? theme.text.accent
                          : "transparent",
                    },
                  ]}
                  onPress={() => setSelectedMood(idx)}
                >
                  <Text style={styles.moodEmoji}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { borderColor: theme.text.accent },
          ]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitText, { color: theme.text.primary }]}>
            Submit
          </Text>
        </TouchableOpacity>

        {/* Previous Entries */}
        <ScrollView contentContainerStyle={{marginVertical:20}}>
          {entries.map((item) => (
            <View
              key={item.id}
              style={[
                styles.cardsiaplay,
                {
                  backgroundColor: theme.components.card,
                  marginBottom: 12,
                  alignSelf:'center'
                },
              ]}
            >
               <Text style={{ fontSize: 22 }}>{item.mood}</Text>
              <View style={{marginLeft:20}}>
   <Text style={{ marginVertical: 8, color: theme.text.primary }}>
                {item.note}
              </Text>
              <Text style={{ fontSize: 12, opacity: 0.6,color:theme.text.primary }}>
                {formatTime(new Date(item.timestamp))}
              </Text>
              </View>
             
           
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Info Modal */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#0D1B2A", "#1B2C3A"]}
            style={styles.infoCard}
          >
            <Text style={styles.modalTitle}>Mood Journal</Text>
            <Text style={styles.modalText}>
              This space is designed to act as a diary to your life.
              {"\n\n"}
              Whatever you write exact date and time will be recorded.
              Once added, this cannot be edited or changed.
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
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
    width:'100%'
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  glowLayer: {
    position: "absolute",
    bottom: -10,
    width: "90%",
    height: "95%",
    borderRadius: 20,
    opacity: 0.6,
  },
  card: {
    width: "95%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    elevation: 5,
    alignItems: "center",
  },
  cardsiaplay:{
    width: "95%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    elevation: 5,
    alignItems: "center",

    flexDirection:'row'
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputBox: {
    width: "100%",
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  moodRow: {
  flexDirection: "row",
  justifyContent: "center",  // keeps them grouped in the middle
  flexWrap: "wrap",          // (optional) lets them wrap on small screens
  marginTop: 8,
},

moodOption: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderWidth: 2,
  justifyContent: "center",
  alignItems: "center",
  marginHorizontal: 8,   // equal spacing between emojis
},
  moodEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
  submitBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
  },
  
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
});

export default MoodJournalScreen;
