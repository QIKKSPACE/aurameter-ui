import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../constants/context/ThemeContext";  
import ScreenBackground from "../components/ScreenBackground";
import { createQuiz, fetchQuizzes } from "../store/quizSlice";
import { useNavigation } from "@react-navigation/native";
import { uuidv4 } from "../utils/uuid";
import Ionicons from "react-native-vector-icons/Ionicons";

const AllQuizScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { drafts, quizzes, loading, error } = useSelector(state => state.quiz);

  const [modalVisible, setModalVisible] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");

  // ────────── Fetch quizzes on mount ──────────
  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  // ────────── Add Quiz Handler ──────────
  const handleAddQuiz = () => {
    if (!quizName.trim()) return;

    const localId = uuidv4();

    const action = createQuiz({
      localId,
      quizName: quizName.trim(),
      description: quizDescription.trim(),
      createdBy: "currentUserId" // replace with actual user UUID from auth
    });
    const newQuiz = action.payload;

    dispatch(action);

    navigation.navigate("CreateQuiz", { quizId: newQuiz.localId });

    setQuizName("");
    setQuizDescription("");
    setModalVisible(false);
  };

  // ────────── Retry fetch ──────────
  const handleRetry = () => {
    dispatch(fetchQuizzes());
  };

let displayQuizzes = [];
if (loading) {
  displayQuizzes = drafts; // show only drafts while loading
} else if (error) {
  displayQuizzes = drafts; // show only drafts when error
} else {
  displayQuizzes = [...drafts, ...quizzes]; // show everything
}

// Check if empty (no quizzes to show) after loading/error
const isEmpty = !loading && !displayQuizzes.length;
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          All Quizzes
        </Text>

        {loading && (
          <View style={{ marginBottom: 16, alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.text.accent} />
            <Text style={{ color: theme.text.primary, marginTop: 8 }}>
              Loading quizzes...
            </Text>
          </View>
        )}

        { error && (
          <View style={{ marginBottom: 16, alignItems: "center" }}>
            <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={[styles.retryBtn, { backgroundColor: theme.text.accent }]}
            >
              <Text style={{ color: "#fff" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
  {(isEmpty && !error )&& (
  <TouchableOpacity style={styles.empty} 
    onPress={() => setModalVisible(true)}>
    <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
      No Quiz Created
    </Text>
    <Text style={{ color: theme.text.secondary, marginVertical: 8 }}>
      Create and share quizzes with friends
    </Text>

    <TouchableOpacity
      style={[styles.request, { borderColor: theme.text.accent }]}
      onPress={() => setModalVisible(true)}
    >
      <Text style={{ color: theme.text.accent, fontWeight: "700" }}>
        Create Quiz
      </Text>
    </TouchableOpacity>
  </TouchableOpacity>
)}
        <FlatList
          data={displayQuizzes}
          keyExtractor={item => item.localId}
        renderItem={({ item }) => {
  const isDraft = item.status === "draft";

  return (
    <TouchableOpacity
      style={[
        styles.quizCard,
        {
          backgroundColor: theme.components.card,
          borderColor: theme.components.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
      ]}
      onPress={() => {
        if (isDraft) {
          navigation.navigate("CreateQuiz", { quizId: item.localId });
        }
      }}
      activeOpacity={isDraft ? 0.7 : 1}
    >
      {/* LEFT CONTENT */}
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[styles.quizName, { color: theme.text.primary }]}>
          {item.quizName}
        </Text>

        <Text
          style={[styles.quizDesc, { color: theme.text.secondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {!isDraft && (
          <Text style={{ color: theme.text.accent, fontSize: 12, marginTop: 4 }}>
            Published
          </Text>
        )}
      </View>

      {/* RIGHT ACTION */}
      {!isDraft && (
        <TouchableOpacity
          onPress={() => {
 navigation.navigate("StoryUploadScreen", { quiz: item });
            // TODO: dispatch(sendQuizToStory(item.localId))
          }}
        >
          <Ionicons
            name="paper-plane-outline"
            size={22}
            color={theme.text.accent}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}}

        />

        {/* ───── Add Quiz Button ───── */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.text.accent }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Quiz</Text>
        </TouchableOpacity>

        {/* ───── Modal ───── */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.components.card }
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                New Quiz
              </Text>

              <TextInput
                placeholder="Quiz Name"
                placeholderTextColor={theme.text.muted}
                style={[styles.input, { color: theme.text.primary }]}
                maxLength={50}
                value={quizName}
                onChangeText={setQuizName}
              />

              <TextInput
                placeholder="Description (max 200 chars)"
                placeholderTextColor={theme.text.muted}
                style={[styles.input, { color: theme.text.primary, height: 80 }]}
                maxLength={200}
                value={quizDescription}
                onChangeText={setQuizDescription}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalBtn, { backgroundColor: theme.components.border }]}
                >
                  <Text style={{ color: theme.text.primary }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddQuiz}
                  style={[styles.modalBtn, { backgroundColor: theme.text.accent }]}
                >
                  <Text style={{ color: "#fff" }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    

    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  quizCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12
  },
  quizName: { fontSize: 16, fontWeight: "600" },
  quizDesc: { fontSize: 14, marginTop: 4 },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },
  modalContent: { padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  empty: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 40,
  paddingHorizontal: 20
},
emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
request: {
  borderWidth: 1.5,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 14,
  marginTop: 12
}

});

export default AllQuizScreen;
