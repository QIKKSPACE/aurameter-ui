// src/screens/MoodJournalScreen.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  AppState,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import LinearGradient from "react-native-linear-gradient";
import api from "../services/api";
import { useToast } from "../constants/context/ErrorContext";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../store/userSlice";
import {
  appendJournalEntries,
  prependJournalEntry,
  selectJournalEntries,
  selectJournalHasMore,
  selectJournalPage,
  setJournalEntries,
  setJournalHasMore,
  setJournalPage,
} from "../store/journalSlice";

const PAGE_SIZE = 10;

const MoodJournalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.userData);
  const journalEntries = useSelector(selectJournalEntries);
  const journalPage = useSelector(selectJournalPage);
  const journalHasMore = useSelector(selectJournalHasMore);

  const [note, setNote] = useState("");
  const [infoVisible, setInfoVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(journalEntries.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadMoreBlocked, setLoadMoreBlocked] = useState(false);

  const appState = useRef(AppState.currentState);

  const formatTime = (date) =>
    date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const normalizeEntries = (payload) => {
    const list =
      payload?.entries ??
      payload?.journals ??
      payload?.data ??
      payload?.items ??
      payload?.journal ??
      [];

    return Array.isArray(list) ? list : [];
  };

  const normalizeJournalItem = (item) => ({
    id: item?.id?.toString?.() ?? item?._id?.toString?.() ?? Date.now().toString(),
    note: item?.note ?? item?.text ?? item?.message ?? "",
    timestamp: item?.timestamp ?? item?.createdAt ?? new Date().toISOString(),
  });

  const fetchEntries = useCallback(
    async ({ pageToLoad = 1, append = false, silent = false } = {}) => {
      if (!silent) {
        if (append) {
          setLoadingMore(true);
        }
      }

      try {
        const response = await api.get("/journal", {
          params: {
            page: pageToLoad,
            limit: PAGE_SIZE,
          },
        });

        const normalized = normalizeEntries(response?.data).map(normalizeJournalItem);
        const nextHasMore =
          response?.data?.hasMore ??
          response?.data?.nextPage ??
          normalized.length === PAGE_SIZE;

        if (append) {
          dispatch(appendJournalEntries(normalized));
        } else {
          dispatch(setJournalEntries(normalized));
        }
        dispatch(setJournalPage(pageToLoad));
        dispatch(setJournalHasMore(Boolean(nextHasMore)));
        setLoadMoreBlocked(false);
      } catch (error) {
        console.log("Journal fetch error:", error?.response?.data || error);
        showToast("Failed to load journal entries", "error");
        if (append) {
          setLoadMoreBlocked(true);
          dispatch(setJournalHasMore(false));
        }
      } finally {
        if (!silent) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [dispatch, showToast],
  );

  useEffect(() => {
    if (journalEntries.length > 0) {
      setLoading(false);
      return;
    }

    fetchEntries({ pageToLoad: 1 });
  }, [fetchEntries, journalEntries.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = async () => {
    const trimmedNote = note.trim();
    if (!trimmedNote || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.post("/journal", {
        note: trimmedNote,
      });

      if (response?.data?.success) {
        const createdEntry = normalizeJournalItem(
          response?.data?.journal ??
            response?.data?.entry ??
            response?.data?.data ??
            {
              note: trimmedNote,
              timestamp: new Date().toISOString(),
            },
        );

        dispatch(prependJournalEntry(createdEntry));
        setNote("");
        setLoadMoreBlocked(false);

        dispatch(
          updateUserData({
            aura: (user?.aura || 0) + 2,
          }),
        );

        showToast("Journal saved successfully", "success");
      } else {
        showToast(response?.data?.message || "Failed to save journal", "error");
      }
    } catch (error) {
      console.log("Journal submit error:", error?.response?.data || error);
      showToast("Failed to save journal", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreEntries = () => {
    if (loadingMore || loading || !journalHasMore || loadMoreBlocked) return;
    fetchEntries({ pageToLoad: journalPage + 1, append: true });
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => navigation.goBack()}
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
              What's on your mind today?
            </Text>

            <Text style={[styles.dateText, { color: theme.text.primary }]}>
              {formatTime(currentTime)}
            </Text>

            <TextInput
              placeholder="Write your thoughts..."
              placeholderTextColor={theme.text.secondary}
              value={note}
              onChangeText={setNote}
              multiline={true}
              textAlignVertical="top"
              style={[
                styles.inputBox,
                {
                  backgroundColor: theme.components.box,
                  color: theme.text.primary,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { borderColor: theme.text.accent, opacity: submitting ? 0.7 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={[styles.submitText, { color: theme.text.primary }]}>
            {submitting ? "Posting..." : "Submit"}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={journalEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ marginVertical: 20 }}
          onEndReached={loadMoreEntries}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#00E5FF" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.cardsiaplay,
                {
                  backgroundColor: theme.components.card,
                  marginBottom: 12,
                  alignSelf: "center",
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ marginVertical: 4, color: theme.text.primary }}>
                  {item.note}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    opacity: 0.6,
                    color: theme.text.primary,
                    marginTop: 6,
                  }}
                >
                  {formatTime(new Date(item.timestamp))}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

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
              Whatever you write exact date and time will be recorded. Once
              added, this cannot be edited or changed.
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
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    width: "100%",
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
  cardsiaplay: {
    width: "95%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    elevation: 5,
    alignItems: "center",
    flexDirection: "row",
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
    minHeight: 100,
    maxHeight: 160,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
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
