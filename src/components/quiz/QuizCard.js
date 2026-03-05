// src/components/quiz/QuizCard.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "../../constants/context/ThemeContext";

export default function QuizCard({ quiz, onNext, index, total }) {
  const { theme } = useTheme();

  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // calculate timer from question length
  const getTimeForQuestion = (question) => {
    const base = 6;
    const perWord = 0.5;
    return Math.min(
      20,
      Math.round(base + question.split(" ").length * perWord)
    );
  };

  // start timer + fade in
  useEffect(() => {
    if (!quiz) return;

    setSelected(null);
    setSubmitted(false);

    const duration = getTimeForQuestion(quiz.question);
    setTimeLeft(duration);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
      setSubmitted(true);

setTimeout(() => {
  onNext();
}, 1200);
return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz]);

  const getOptionBorder = (idx) => {
    if (!submitted) {
      return selected === idx
        ? theme.text.accent
        : theme.components.border;
    }

    if (idx === quiz.correctIndex) return "#22c55e";
    if (idx === selected) return "#ef4444";
    return theme.components.border;
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.components.card,
            borderColor: theme.components.border,
          },
        ]}
      >  
        {/* TIMER */}
<Text
  style={{
    alignSelf: "space-between",
    marginBottom: 6,
    fontWeight: "700",
    color: theme.text.primary,
  }}
>
  Question {index + 1} / {total} • ⏱ {timeLeft}s
</Text>

        <Text style={[styles.question, { color: theme.text.primary }]}>
          {quiz.question}
        </Text>

        {quiz.options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            disabled={submitted}
            style={[
              styles.option,
              { borderColor: getOptionBorder(idx) },
            ]}
            onPress={() => setSelected(idx)}
          >
            <Text style={{ color: theme.text.primary, fontWeight: "600" }}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          disabled={selected === null || submitted}
          style={[
            styles.submit,
            {
              borderColor:
                selected === null || submitted
                  ? theme.components.border
                  : theme.text.accent,
              opacity: submitted ? 0.5 : 1,
            },
          ]}
         onPress={() => {
  setSubmitted(true);
  setTimeout(() => {
    onNext();
  }, 1200);
}}
        >
          <Text style={{ color: theme.text.accent, fontWeight: "700" }}>
            Submit
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  card: {
    width: "95%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  question: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
  },
  option: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  submit: {
    marginTop: 10,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
});
