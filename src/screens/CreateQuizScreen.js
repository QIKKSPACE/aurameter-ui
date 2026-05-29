import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Feather";
import ScreenBackground from "../components/ScreenBackground";
import { useTheme } from "../constants/context/ThemeContext";
import { makeSelectQuizByLocalId } from "../store/quizSelectors";
import {
  addQuestion,
  deleteQuestion,
  fetchQuizzes,
  updateQuestion,
  updateQuizMeta,
} from "../store/quizSlice";
import api from "../services/api";

const createOption = () => ({
  id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text: "",
  isCorrect: false,
});

const createQuestion = () => ({
  text: "",
  options: [createOption(), createOption()],
});

const normalizeQuestionForCreate = (question) => ({
  ...question,
  options:
    Array.isArray(question?.options) && question.options.length >= 2
      ? question.options
      : [createOption(), createOption()],
});

const getQuestionIssues = (question) => {
  if (!question) return ["Question missing."];

  const issues = [];
  if (!question.text?.trim()) {
    issues.push("Add a question prompt.");
  }

  if (!Array.isArray(question.options) || question.options.length < 2) {
    issues.push("Each question needs at least 2 options.");
  }

  if (Array.isArray(question.options)) {
    const emptyOptions = question.options.some((option) => !option.text?.trim());
    if (emptyOptions) {
      issues.push("Fill in every option.");
    }

    const correctCount = question.options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      issues.push("Pick exactly 1 correct answer.");
    }
  }

  return issues;
};

const CreateQuizScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { quizId: localId } = route.params || {};

  const selectQuizByLocalId = useMemo(makeSelectQuizByLocalId, []);
  const quiz = useSelector((state) => selectQuizByLocalId(state, localId));
  const user = useSelector((state) => state.user.userData);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const questions = quiz?.questions ?? [];
  const activeQuestion = questions[activeIndex] ?? null;

  useEffect(() => {
    if (!quiz?.localId) {
      navigation.goBack();
    }
  }, [navigation, quiz?.localId]);

  useEffect(() => {
    if (quiz?.localId && questions.length === 0) {
      dispatch(
        addQuestion({
          localId,
          question: createQuestion(),
        })
      );
    }
  }, [dispatch, localId, questions.length, quiz?.localId]);

  useEffect(() => {
    if (activeIndex > questions.length - 1) {
      setActiveIndex(Math.max(questions.length - 1, 0));
    }
  }, [activeIndex, questions.length]);

  const currentQuestionIssues = useMemo(
    () => getQuestionIssues(activeQuestion),
    [activeQuestion]
  );

  const quizIssues = useMemo(() => {
    const issues = [];

    if (!quiz?.quizName?.trim()) {
      issues.push("Give the quiz a title.");
    }

    if (!questions.length) {
      issues.push("Add at least 1 question.");
    }

    questions.forEach((question, index) => {
      const questionProblems = getQuestionIssues(question);
      questionProblems.forEach((problem) => {
        issues.push(`Question ${index + 1}: ${problem}`);
      });
    });

    return issues;
  }, [questions, quiz?.quizName]);

  const isCurrentQuestionValid = currentQuestionIssues.length === 0;
  const isQuizValid = quizIssues.length === 0;

  const updateMeta = (data) => {
    dispatch(
      updateQuizMeta({
        localId,
        data,
      })
    );
  };

  const updateQuestionText = (text) => {
    if (!activeQuestion) return;
    dispatch(
      updateQuestion({
        localId,
        questionId: activeQuestion.id,
        data: { text },
      })
    );
  };

  const updateOptionText = (optionId, text) => {
    if (!activeQuestion) return;

    dispatch(
      updateQuestion({
        localId,
        questionId: activeQuestion.id,
        data: {
          options: activeQuestion.options.map((option) =>
            option.id === optionId ? { ...option, text } : option
          ),
        },
      })
    );
  };

  const markCorrect = (optionId) => {
    if (!activeQuestion) return;

    dispatch(
      updateQuestion({
        localId,
        questionId: activeQuestion.id,
        data: {
          options: activeQuestion.options.map((option) => ({
            ...option,
            isCorrect: option.id === optionId,
          })),
        },
      })
    );
  };

  const addOption = () => {
    if (!activeQuestion || activeQuestion.options.length >= 4) return;

    dispatch(
      updateQuestion({
        localId,
        questionId: activeQuestion.id,
        data: {
          options: [...activeQuestion.options, createOption()],
        },
      })
    );
  };

  const deleteOption = (optionId) => {
    if (!activeQuestion || activeQuestion.options.length <= 2) return;

    const nextOptions = activeQuestion.options.filter((option) => option.id !== optionId);
    const hasCorrect = nextOptions.some((option) => option.isCorrect);

    dispatch(
      updateQuestion({
        localId,
        questionId: activeQuestion.id,
        data: {
          options: hasCorrect
            ? nextOptions
            : nextOptions.map((option, index) => ({
                ...option,
                isCorrect: index === 0,
              })),
        },
      })
    );
  };

  const addQuestionHere = () => {
    if (questions.length >= 10) return;

    dispatch(
      addQuestion({
        localId,
        question: createQuestion(),
      })
    );
    setActiveIndex(questions.length);
  };

  const deleteCurrentQuestion = () => {
    if (!activeQuestion) return;

    if (questions.length <= 1) {
      Alert.alert("Keep 1 question", "A quiz needs at least 1 question.");
      return;
    }

    dispatch(
      deleteQuestion({
        localId,
        questionId: activeQuestion.id,
      })
    );

    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const publishQuiz = async () => {
    if (!isQuizValid) {
      Alert.alert("Quiz needs attention", quizIssues[0] || "Complete the quiz first.");
      return;
    }

    const payload = {
      title: quiz.quizName.trim(),
      description: quiz.description?.trim() || "",
      userId: user?.id,
      localId,
      questions: questions.map((question) => {
        const normalized = normalizeQuestionForCreate(question);
        const correctIndex = normalized.options.findIndex((option) => option.isCorrect);

        return {
          text: normalized.text.trim(),
          options: normalized.options.map((option) => ({
            text: option.text.trim(),
          })),
          correctIndex,
        };
      }),
    };

    setIsPublishing(true);
    try {
      const res = await api.post("/quiz/", payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Could not publish quiz.");
      }

      updateMeta({
        status: "synced",
        serverId: res.data?.quiz?._id || res.data?._id || quiz.serverId || null,
      });

      dispatch(fetchQuizzes());
      Alert.alert("Quiz published", "Your quiz is ready to share.");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Publish failed",
        error?.response?.data?.message || error?.message || "Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (!quiz?.localId || !activeQuestion) {
    return (
      <ScreenBackground>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.text.accent} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            Preparing quiz editor...
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.headerIcon, { backgroundColor: theme.components.card }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={18} color={theme.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Create Quiz</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              {questions.length} question{questions.length === 1 ? "" : "s"} built
            </Text>
          </View>

          <View
            style={[
              styles.progressChip,
              { backgroundColor: theme.components.card, borderColor: theme.components.border },
            ]}
          >
            <Text style={[styles.progressChipText, { color: theme.text.primary }]}>
              {activeIndex + 1}/10
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.components.card,
                borderColor: theme.components.border,
              },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>
              Quiz Details
            </Text>

            <TextInput
              placeholder="Quiz title"
              placeholderTextColor={theme.text.primary}
              style={[
                styles.titleInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.components.border,
                },
              ]}
              value={quiz.quizName}
              onChangeText={(text) => updateMeta({ quizName: text })}
              maxLength={50}
            />

            <TextInput
              placeholder="Short description"
              placeholderTextColor={theme.text.primary}
              style={[
                styles.descriptionInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.components.border,
                },
              ]}
              value={quiz.description}
              onChangeText={(text) => updateMeta({ description: text })}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />

            <Text style={[styles.helperText, { color: theme.text.secondary }]}>
              Keep it crisp so friends know what this quiz is about.
            </Text>
          </View>

          <View style={styles.questionRail}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {questions.map((question, index) => {
                const valid = getQuestionIssues(question).length === 0;
                const isActive = index === activeIndex;

                return (
                  <TouchableOpacity
                    key={question.id}
                    onPress={() => setActiveIndex(index)}
                    style={[
                      styles.questionPill,
                      {
                        backgroundColor: isActive
                          ? theme.text.accent
                          : theme.components.card,
                        borderColor: isActive
                          ? theme.text.accent
                          : valid
                            ? theme.components.border
                            : "#F97316",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.questionPillText,
                        {
                          color: isActive ? "#FFFFFF" : theme.text.primary,
                        },
                      ]}
                    >
                      Q{index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.components.card,
                borderColor: theme.components.border,
              },
            ]}
          >
            <View style={styles.questionHeader}>
              <View>
                <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>
                  Question {activeIndex + 1}
                </Text>
                <Text style={[styles.questionTitle, { color: theme.text.primary }]}>
                  Build the prompt and answers
                </Text>
              </View>

              <TouchableOpacity
                onPress={deleteCurrentQuestion}
                style={[
                  styles.deleteChip,
                  { borderColor: theme.components.border },
                ]}
              >
                <Icon name="trash-2" size={16} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Type your question"
              placeholderTextColor={theme.text.primary}
              style={[
                styles.questionInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.components.border,
                },
              ]}
              value={activeQuestion.text}
              onChangeText={updateQuestionText}
              multiline
            />

            {activeQuestion.options.map((option, optionIndex) => (
              <View
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: option.isCorrect
                      ? `${theme.text.accent}18`
                      : "transparent",
                    borderColor: option.isCorrect
                      ? theme.text.accent
                      : theme.components.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.optionSelector}
                  onPress={() => markCorrect(option.id)}
                >
                  <View
                    style={[
                      styles.optionDot,
                      {
                        borderColor: option.isCorrect
                          ? theme.text.accent
                          : theme.text.secondary,
                        backgroundColor: option.isCorrect
                          ? theme.text.accent
                          : "transparent",
                      },
                    ]}
                  />
                </TouchableOpacity>

                <TextInput
                  placeholder={`Option ${optionIndex + 1}`}
                  placeholderTextColor={theme.text.primary}
                  style={[styles.optionInput, { color: theme.text.primary }]}
                  value={option.text}
                  onChangeText={(text) => updateOptionText(option.id, text)}
                />

                {activeQuestion.options.length > 2 ? (
                  <TouchableOpacity onPress={() => deleteOption(option.id)}>
                    <Icon name="x" size={18} color={theme.text.secondary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            <View style={styles.inlineActions}>
              <TouchableOpacity
                onPress={addOption}
                disabled={activeQuestion.options.length >= 4}
                style={[
                  styles.secondaryAction,
                  {
                    opacity: activeQuestion.options.length >= 4 ? 0.5 : 1,
                    borderColor: theme.components.border,
                  },
                ]}
              >
                <Icon name="plus" size={16} color={theme.text.primary} />
                <Text style={[styles.secondaryActionText, { color: theme.text.primary }]}>
                  Add option
                </Text>
              </TouchableOpacity>

              <Text style={[styles.helperText, { color: theme.text.secondary }]}>
                Tap the circle to mark the correct answer.
              </Text>
            </View>
          </View>

          {currentQuestionIssues.length ? (
            <View
              style={[
                styles.warningBox,
                { backgroundColor: "rgba(249,115,22,0.14)", borderColor: "#F97316" },
              ]}
            >
              <Text style={styles.warningTitle}>Current question needs work</Text>
              <Text style={styles.warningBody}>{currentQuestionIssues[0]}</Text>
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <TouchableOpacity
              disabled={activeIndex === 0}
              onPress={() => setActiveIndex((index) => Math.max(index - 1, 0))}
              style={[
                styles.navButton,
                {
                  backgroundColor: theme.components.card,
                  borderColor: theme.components.border,
                  opacity: activeIndex === 0 ? 0.45 : 1,
                },
              ]}
            >
              <Text style={[styles.navButtonText, { color: theme.text.primary }]}>
                Previous
              </Text>
            </TouchableOpacity>

            {activeIndex < questions.length - 1 ? (
              <TouchableOpacity
                disabled={!isCurrentQuestionValid}
                onPress={() => setActiveIndex((index) => index + 1)}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.text.accent,
                    opacity: isCurrentQuestionValid ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled={!isCurrentQuestionValid || questions.length >= 10}
                onPress={addQuestionHere}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.text.accent,
                    opacity:
                      isCurrentQuestionValid && questions.length < 10 ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={styles.primaryButtonText}>New Question</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            disabled={!isQuizValid || isPublishing}
            onPress={publishQuiz}
            style={[
              styles.publishButton,
              {
                backgroundColor: theme.text.accent,
                opacity: !isQuizValid || isPublishing ? 0.55 : 1,
              },
            ]}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.publishButtonText}>Publish Quiz</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressChip: {
    minWidth: 58,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    marginTop: 12,
    minHeight: 96,
  },
  helperText: {
    fontSize: 12,
    marginTop: 10,
  },
  questionRail: {
    marginBottom: 14,
  },
  questionPill: {
    minWidth: 54,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 14,
  },
  questionPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  deleteChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 92,
    textAlignVertical: "top",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 56,
    marginTop: 12,
  },
  optionSelector: {
    paddingRight: 10,
    paddingVertical: 8,
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  optionInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  inlineActions: {
    marginTop: 12,
  },
  secondaryAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  warningTitle: {
    color: "#FDBA74",
    fontSize: 13,
    fontWeight: "700",
  },
  warningBody: {
    color: "#FFEDD5",
    fontSize: 13,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  publishButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CreateQuizScreen;
