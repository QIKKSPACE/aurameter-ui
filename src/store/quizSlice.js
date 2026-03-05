import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import api from "../services/api";


/* ───────────────── ASYNC THUNKS ───────────────── */

// GET /api/quiz
export const fetchQuizzes = createAsyncThunk(
  "quiz/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/quiz");

      return res.data.map(q => ({
        ...q,
        quizName: q.title,   // 🔥 normalize here
        serverId: q._id
      }));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch quizzes"
      );
    }
  }
);

/* ───────────────── INITIAL STATE ───────────────── */

const initialState = {
  drafts: [],
  quizzes: [],

  loading: false,
  error: null,

  lastFetched: null
};

/* ───────────────── SLICE ───────────────── */

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    // ───────────── CREATE DRAFT ─────────────
    createQuiz: {
      reducer(state, action) {
        state.drafts.push(action.payload);
      },
      prepare({ localId, quizName, description, createdBy }) {
        return {
          payload: {
            localId,
            serverId: null,

            quizName,
            description,
            createdBy,

            status: "draft", // draft | syncing | synced | error
            questions: [],

            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        };
      }
    },

    // ───────────── UPDATE QUIZ META ─────────────
    updateQuizMeta(state, action) {
      const { localId, data } = action.payload;

      const quiz =
        state.drafts.find(q => q.localId === localId) ||
        state.quizzes.find(q => q.localId === localId);

      if (quiz) {
        Object.assign(quiz, data);
        quiz.updatedAt = Date.now();
      }
    },

    // ───────────── DELETE QUIZ ─────────────
    deleteQuiz(state, action) {
      const localId = action.payload;
      state.drafts = state.drafts.filter(q => q.localId !== localId);
      state.quizzes = state.quizzes.filter(q => q.localId !== localId);
    },

    // ───────────── QUESTIONS ─────────────
    addQuestion: {
      reducer(state, action) {
        const { localId, question } = action.payload;
        const quiz = state.drafts.find(q => q.localId === localId);
        if (quiz) quiz.questions.push(question);
      },
      prepare({ localId, question }) {
        return {
          payload: {
            localId,
            question: {
              id: nanoid(),
              points: 1,
              ...question
            }
          }
        };
      }
    },

    updateQuestion(state, action) {
      const { localId, questionId, data } = action.payload;
      const quiz = state.drafts.find(q => q.localId === localId);
      if (!quiz) return;

      const question = quiz.questions.find(q => q.id === questionId);
      if (question) Object.assign(question, data);
    },

    deleteQuestion(state, action) {
      const { localId, questionId } = action.payload;
      const quiz = state.drafts.find(q => q.localId === localId);
      if (quiz) {
        quiz.questions = quiz.questions.filter(q => q.id !== questionId);
      }
    },

    // ───────────── SYNC FLAGS ─────────────
    markQuizSyncing(state, action) {
      const quiz = state.drafts.find(q => q.localId === action.payload);
      if (quiz) quiz.status = "syncing";
    },

    markQuizError(state, action) {
      const { localId, error } = action.payload;
      const quiz = state.drafts.find(q => q.localId === localId);
      if (quiz) {
        quiz.status = "error";
        quiz.error = error;
      }
    },

    forceFetchQuizzes(state) {
      state.lastFetched = null;
    }
  },

  /* ───────────────── EXTRA REDUCERS ───────────────── */

  extraReducers: builder => {
    builder

      // ───────── FETCH PENDING ─────────
      .addCase(fetchQuizzes.pending, state => {
        state.loading = true;
        state.error = null;
      })

      // ───────── FETCH SUCCESS ─────────
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        const serverQuizzes = action.payload;

        serverQuizzes.forEach(serverQuiz => {
          const localId = serverQuiz.localId;

          // Remove matching draft
          state.drafts = state.drafts.filter(
            draft => draft.localId !== localId
          );

          // Update or insert quiz
          const existing = state.quizzes.find(
            q => q.localId === localId
          );

          if (existing) {
            Object.assign(existing, {
              ...serverQuiz,
              serverId: serverQuiz._id,
              status: "synced"
            });
          } else {
            state.quizzes.push({
              ...serverQuiz,
              localId,
              serverId: serverQuiz._id,
              status: "synced"
            });
          }
        });

        state.loading = false;
        state.lastFetched = Date.now();
      })

      // ───────── FETCH ERROR ─────────
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  }
});

/* ───────────────── EXPORTS ───────────────── */

export const {
  createQuiz,
  updateQuizMeta,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  markQuizSyncing,
  markQuizError,
  forceFetchQuizzes  
} = quizSlice.actions;

export default quizSlice.reducer;
