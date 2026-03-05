import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useTheme } from "../constants/context/ThemeContext";
import ScreenBackground from "../components/ScreenBackground";
import { useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { makeSelectQuizByLocalId } from "../store/quizSelectors"; 
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../store/quizSlice";
import api from "../services/api";
/* ─────────── Factory helpers ─────────── */

const createOption = () => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  isCorrect: false,
});

const createQuestion = () => ({
  id: `${Date.now()}`, 
  text: "",
  options: [createOption(), createOption()],
});

/* ─────────── Screen ─────────── */

const CreateQuizScreen = () => {
  const { theme } = useTheme();
 const route = useRoute();
const { quizId: localId } = route.params;
 const dispatch=useDispatch()
const selectQuizByLocalId = useMemo(makeSelectQuizByLocalId, []);
const quiz = useSelector(state =>
  selectQuizByLocalId(state, localId)
);
const [isPublishing,setIsPublishing]=useState(false)
  const user=useSelector(state=>state.user.userData)
  const accessToken=useSelector(state=>state.user.token)


const questions = quiz?.questions ?? [];


  const [activeIndex, setActiveIndex] = useState(0);

const activeQuestion = questions[activeIndex] ?? null;
  
  /* ─────────── Question handlers ─────────── */
useEffect(() => {
  // Only add a default question if:
  // 1. The quiz exists
  // 2. It has no questions yet

  if (quiz && questions.length === 0) {
    dispatch(
      addQuestion({
        localId,
        question: createQuestion(),
      })
    );
  }
}, [quiz, questions.length, dispatch, localId]);


 const updateQuestionText = text => {
  dispatch(
    updateQuestion({
      localId,
      questionId: activeQuestion.id,
      data: { text }
    })
  );
};
const addQuestionHere = () => {
  if (questions.length >= 10) return;

  dispatch(
    addQuestion({
      localId,
      question: {
        text: "",
        options: [
         createOption(),
          createOption()
        ]
      }
    })
  );

  setActiveIndex(questions.length); // move to new question
};

const deleteCurrentQuestion = () => {
  if (questions.length < 2) return;
  dispatch(
    deleteQuestion({
      localId,
      questionId: activeQuestion.id
    })
  );

  setActiveIndex(i => Math.max(0, i - 1));
};

  /* ─────────── Option handlers ─────────── */
const updateOptionText = (oid, text) => {
  const updatedOptions = activeQuestion.options.map(o =>
    o.id === oid ? { ...o, text } : o
  );

  dispatch(
    updateQuestion({
      localId,
      questionId: activeQuestion.id,
      data: { options: updatedOptions }
    })
  );
};


 const addOption = () => {
  if (activeQuestion.options.length >= 4) return;

  dispatch(
    updateQuestion({
      localId,
      questionId: activeQuestion.id,
      data: {
        options: [
          ...activeQuestion.options,
          { id: `${Date.now()}`, text: "", isCorrect: false }
        ]
      }
    })
  );
};

 const deleteOption = oid => {
  if (activeQuestion.options.length <= 2) return;

  dispatch(
    updateQuestion({
      localId,
      questionId: activeQuestion.id,
      data: {
        options: activeQuestion.options.filter(o => o.id !== oid)
      }
    })
  );
};


  const markCorrect = oid => {
  const updatedOptions = activeQuestion.options.map(o => ({
    ...o,
    isCorrect: o.id === oid
  }));

  dispatch(
    updateQuestion({
      localId,
      questionId: activeQuestion.id,
      data: { options: updatedOptions }
    })
  );
};

  /* ─────────── Validation ─────────── */

  const isCurrentQuestionValid = useMemo(() => {
    if(!activeQuestion) return;
    return (
      activeQuestion.text.trim() &&
      activeQuestion.options.every(o => o.text.trim()) &&
      activeQuestion.options.some(o => o.isCorrect)
    );
  }, [activeQuestion]);

  const isQuizValid = useMemo(() => {
    return (
      questions.length >=1 &&
      questions.every(
        q =>
          q.text.trim() &&
          q.options.every(o => o.text.trim()) &&
          q.options.some(o => o.isCorrect)
      )
    );
  }, [questions]);
const publishQuiz = async () => {
   if(!isQuizValid) 
    {
      Alert.alert("Quiz not Valid delete empty questions.")
      return;
    }
     const payload = {
    title: quiz?.quizName || "Untitled Quiz",
    description: quiz.description || "",
    userId: user?.id, // from auth
    localId,
    questions: questions.map(q => {
      // Make sure options exist and are array
      const opts = Array.isArray(q.options) ? q.options : [];

      // Find the index of the correct option
      const correctIndex = opts.findIndex(o => o.isCorrect);

      return {
        text: q.text || "",
        options: q.options.map(o => ({ text: o.text })), // wrap string in object
        correctIndex: correctIndex >= 0 ? correctIndex : 0, // fallback to first option
      };
    }),
  };

  try {
      const res = await api.post("/quiz/", payload);

    if (res?.data?.success) {
     // console.log("Quiz created:", data);    
      // optionally navigate to quiz detail or home
    } else {
      //console.log("Error creating quiz:", data);
    }
  } catch (err) {
    console.log("Network error:", err);
  }  

  // Transform Redux-style quiz to server format
  
};

  /* ─────────── Render ─────────── */
if (!activeQuestion) {
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Preparing first question…</Text>
      </View>
    </ScreenBackground>
  );
}

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Create Quiz
          </Text>

          <Text style={{ color: "white" }}>
            {activeIndex + 1} / 10
          </Text>
        </View>

        {/* Card */}
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
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <Text
                style={[
                  styles.questionIndex,
                  { color: theme.text.accent },
                ]}
              >
                Question {activeIndex + 1}
              </Text>

             
                <TouchableOpacity onPress={deleteCurrentQuestion}>
                  <Icon
                    name="trash-2"
                    size={18}
                    color={theme.text.accent}
                  />
                </TouchableOpacity>
          
            </View>

            {/* Question Input */}
            <TextInput
              placeholder="Type your question"
              placeholderTextColor={theme.text.muted}
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  borderColor: theme.components.border,
                },
              ]}
              value={activeQuestion?.text}
              onChangeText={updateQuestionText}
            />

            {/* Options */}
            {activeQuestion.options.map((o, oi) => (
              <TouchableOpacity
                key={o.id}
                style={[
                  styles.option,
                  {
                    borderColor: o.isCorrect
                      ? theme.text.accent
                      : theme.components.border,
                  },
                ]}
                onPress={() => markCorrect(o.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: o.isCorrect
                        ? theme.text.accent
                        : theme.text.primary,
                    },
                  ]}
                />

                <TextInput
                  placeholder={`Option ${oi + 1}`}
                  placeholderTextColor={theme.text.muted}
                  style={[
                    styles.optionInput,
                    { color: theme.text.primary },
                  ]}
                  value={o.text}
                  onChangeText={t => updateOptionText(o.id, t)}
                />

                {activeQuestion.options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => deleteOption(o.id)}
                  >
                    <Icon
                      name="x"
                      size={16}
                      color={theme.text.muted}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {activeQuestion.options.length < 4 && (
              <TouchableOpacity onPress={addOption}>
                <Text
                  style={[
                    styles.addText,
                    { color: theme.text.accent },
                  ]}
                >
                  + Add option
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Navigation */}
     <View style={styles.navRow}>
  {/* Previous */}
  <TouchableOpacity
    disabled={activeIndex === 0}
    onPress={() => setActiveIndex(i => i - 1)}
    style={[
      styles.navButton,
      { opacity: activeIndex === 0 ? 0.4 : 1 },
    ]}
  >
    <Text style={styles.navText}>← Previous</Text>
  </TouchableOpacity>

  {/* NEXT or ADD */}
  {activeIndex < questions.length - 1 ? (
    /* NEXT */
    <TouchableOpacity
      disabled={!isCurrentQuestionValid}
      onPress={() => setActiveIndex(i => i + 1)}
      style={[
        styles.navButton,
        { opacity: isCurrentQuestionValid ? 1 : 0.4 },
      ]}
    >
      <Text style={styles.navText}>Next →</Text>
    </TouchableOpacity>
  ) : questions.length < 10 ? (
    /* ADD QUESTION */
    <TouchableOpacity
      disabled={!isCurrentQuestionValid}
      onPress={addQuestionHere}
      style={[
        styles.navButton,
        { opacity: isCurrentQuestionValid ? 1 : 0.4 },
      ]}
    >
      <Text style={styles.navText}>+ New Question</Text>
    </TouchableOpacity>
  ) : null}
</View>


        {/* Submit */}
   { questions.length > 1 && (
           <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor:'white' },

              ]}
               onPress={()=>{publishQuiz()}}
               disabled={isPublishing}
            >
              {isPublishing?<ActivityIndicator size={'small'} color={'black'} />:    <Text
                style={[
                  styles.submitText,
                  { color: 'black' },
                ]}
              >
                Publish Quiz
              </Text>}
          
            </TouchableOpacity>
   )}
      </View>
    </ScreenBackground>
  );
};

/* ─────────── Styles ─────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardWrapper: {
    alignItems: "center",
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
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionIndex: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  optionInput: {
    flex: 1,
    fontSize: 15,
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  navText: {
    fontSize: 15,
    fontWeight: "600",
    color:'black'
  },
  submitBtn: {
    marginTop: 20,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width:140,
    alignSelf:'center'
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
  },
  navButton: {
  backgroundColor: "white",
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 10,
  minWidth:100,
  textAlign:'center',
  alignItems:'center'
},
});

export default CreateQuizScreen;
