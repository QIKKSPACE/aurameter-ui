import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, StyleSheet } from "react-native";
import api from "../services/api";
import QuizCardPlay from "../components/quiz/QuizCardPlay";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import Icon from "react-native-vector-icons/Feather";

const UserQuiz = ({ route, navigation }) => {
  const { quizId } = route.params;
  const { theme } = useTheme();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quiz/${quizId}`);

        // 🔁 NORMALIZE DATA
        const formatted = res.data.questions.map((q) => ({
          question: q.text,
          options: q.options.map(o => o.text ?? o),
          correctIndex: q.correctIndex,
        }));

        setQuestions(formatted);
      } catch (err) {
        console.log("FETCH ERROR", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <ActivityIndicator size="large" color={theme.text.accent} />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
        <View style={{flex: 1, padding: 16}}>
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

          
        </View>
      {questions.length > 0 && (
        <QuizCardPlay
          quiz={questions[currentIndex]}
          index={currentIndex}
          total={questions.length}
          onNext={handleNext}
        />
      )}

      {/* RESULT MODAL */}
      <Modal transparent visible={showResult} animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <View style={{
            backgroundColor: theme.components.card,
            padding: 24,
            borderRadius: 16,
            width: "80%"
          }}>
            <Text style={{ fontSize: 20, fontWeight: "700", textAlign: "center" }}>
              Quiz Completed 🎉
            </Text>

            <Text style={{ marginTop: 12, textAlign: "center" }}>
              Score will be calculated later
            </Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20, alignSelf: "center" }}
            >
              <Text style={{ color: theme.text.accent, fontWeight: "700" }}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </View>

    </ScreenBackground>
  );
};

export default UserQuiz;

const styles = StyleSheet.create({
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
})