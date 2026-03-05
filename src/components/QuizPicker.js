import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../store/quizSlice";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function QuizPicker({
  onSelectQuiz,
  onCreateQuiz,
}) {
  const dispatch = useDispatch();
  const { drafts, quizzes, loading } = useSelector(
    (state) => state.quiz
  );

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const allQuizzes = [...drafts, ...quizzes];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Loading quizzes...</Text>
      </View>
    );
  }

  if (!allQuizzes.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No quizzes yet</Text>
        <TouchableOpacity style={styles.createBtn} onPress={onCreateQuiz}>
          <Text style={styles.createText}>Create Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={allQuizzes}
      keyExtractor={(item) => item.localId}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.quizCard}
          onPress={() => onSelectQuiz(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.quizName}>{item.quizName}</Text>
            <Text style={styles.quizDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: { color: "#aaa", marginTop: 8 },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  createText: {
    color: "#000",
    fontWeight: "600",
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  quizName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  quizDesc: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
});
