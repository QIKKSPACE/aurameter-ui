// src/screens/QuizScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import QuizCard from "../components/quiz/QuizCard";
import QuizRequestModal from "../components/quiz/QuizRequestModal";

const DUMMY_QUIZ = [
  {
    question: "Who won the Champions League in 1999?",
    options: [
      "Barcelona",
      "Manchester United",
      "Bayern Munich",
      "Liverpool",
    ],
    correctIndex: 1,
  },
  {
    question: "Which country won the Cricket World Cup 2011?",
    options: ["Australia", "India", "England", "Sri Lanka"],
    correctIndex: 1,
  },
  {
    question: "Who is known as the father of computers?",
    options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"],
    correctIndex: 1,
  },
];

const TOPICS = [
  "Bollywood 🎬",
  "Cricket 🏏",
  "Sports ⚽",
  "Technology 💻",
  "History 🏛️",
  "General Knowledge 🧠",
];

export default function QuizScreen({ navigation }) {
  const { theme } = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
 const requestQuiz = () => {
  setShowModal(false);
  setLoading(true);

  setTimeout(() => {
    setCurrentIndex(0);
    setQuiz(DUMMY_QUIZ);
    setLoading(false);
  }, 1500);
};
const handleNext = () => {
  if (currentIndex < quiz.length - 1) {
    setCurrentIndex((i) => i + 1);
  } else {
    // quiz finished
    setQuiz(null);
    setCurrentIndex(0);
  }
};

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-left"
              size={22}
              color={theme.text.primary}
            />
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("AllQuiz")}>
            <Icon name="plus" size={22} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {!quiz && !loading && (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              No Quiz Available
            </Text>
            <Text style={{ color: theme.text.secondary,textAlign:'center' }}>
              Request a quiz to test your Aura.(This is a dummy tetsing screen, demo quiz available only)
            </Text>

            <TouchableOpacity
              style={[
                styles.request,
                { borderColor: theme.text.accent },
              ]}
              onPress={() => setShowModal(true)}
            >
              <Text style={{ color: theme.text.accent, fontWeight: "700" }}>
                Request Quiz
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.text.accent} />
          </View>
        )}

       {quiz && (
  <QuizCard
    quiz={quiz[currentIndex]}
    onNext={handleNext}
    index={currentIndex}
    total={quiz.length}
  />
)}

        <QuizRequestModal
          visible={showModal}
          topics={TOPICS}
          onSelect={requestQuiz}
          onClose={() => setShowModal(false)}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "700" },
  empty: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  request: {
    marginTop: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loader: {
    marginTop: 100,
    alignItems: "center",
  },
});
